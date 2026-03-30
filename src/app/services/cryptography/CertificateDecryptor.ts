import {inject, Injectable} from '@angular/core';
import forge from 'node-forge';
import {byteToBin, hexToBase64Url} from '../../util/strings.util';
import * as jose from 'jose';
import {CertificateBuilder} from './CertificateBuilder';
import {DecryptedCertificate, DecryptedJWK} from '../../core/types/crypto.types';

@Injectable({providedIn: "root"})
export class CertificateDecryptor {
  #builder = inject(CertificateBuilder);

  async decrypt(file: File, password: string): Promise<DecryptedCertificate> {
    // 1) Extracting data from the file
    const cert = await this.#fileToCertificate(file, password);
    const pksc1 = this.#extractPrivateKey(cert);
    const chain = this.#extractX509Chain(cert, pksc1);
    const leaf = chain[0];
    if (!leaf) throw new Error("No leaf certificate found in the chain.");

    // 3) formating certificate to required format
    const pKey = await this.#PKSC1toCryptoKey(pksc1);
    const pubKey = this.#buildJwk(pksc1, chain);
    const pemCert = chain.map(c => forge.pki.certificateToPem(c)).join('\n');
    const certInfo = this.#builder.build(leaf);

    if (!(pKey && pubKey && pemCert && certInfo)) {
      throw new Error('Not all data extracted - aborting!')
    }

    return {
      pKey: await this.#PKSC1toCryptoKey(pksc1),
      pubKey: this.#buildJwk(pksc1, chain),
      pemCert: chain.map((c: forge.pki.Certificate) => forge.pki.certificateToPem(c)).join('\n'),
      certInfo: this.#builder.build(leaf)
    } satisfies DecryptedCertificate;
  }

  // TODO this throws on some certificate, duno why, needs to be investigated DEEPLY
  async #PKSC1toCryptoKey(pksc1: forge.pki.rsa.PrivateKey) {
    const asn1 = forge.pki.privateKeyToAsn1(pksc1);
    const wrapped = forge.pki.wrapRsaPrivateKey(asn1);
    const pkcs8Pem = forge.pki.privateKeyInfoToPem(wrapped)

    try {
      return await jose.importPKCS8(pkcs8Pem, 'RS256');
    } catch (e) {
      // fallback to RSA-PSS
      console.error("Error decrypting certificate with RS256", {cause: e})
    }
    try {
      return await jose.importPKCS8(pkcs8Pem, 'PS256');
    } catch (e) {
      console.error("Error decrypting certificate with PS256", {cause: e})
    }
    try {
      const encoded = pkcs8Pem.replace(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, '')
      const keyData = this.decodeBase64(encoded);
      return crypto.subtle.importKey(`pkcs8`,
        new Uint8Array(keyData),
        {name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${'RS256'.slice(-3)}`},
        false,
        ['sign'])
    } catch (e) {
      console.error("Error decrypting manually", e);
      throw e;
    }

    //return await jose.importPKCS8(pkcs8Pem, 'RS256');
  }

  decodeBase64(encoded: string): Uint8Array {
    if ((Uint8Array as any).fromBase64) {
      return (Uint8Array as any).fromBase64(encoded);
    }

    // fallback
    return Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  }

  #extractPrivateKey(cert_p12: forge.pkcs12.Pkcs12Pfx) {
    const keyBags = cert_p12
      .getBags({bagType: forge.pki.oids['pkcs8ShroudedKeyBag']});
    const bag = keyBags[forge.pki.oids["pkcs8ShroudedKeyBag"]]?.[0];
    if (!bag?.key) throw new Error("Key in the certificated not found!!!");
    return bag.key;
  }

  #buildJwk(pksc1: forge.pki.rsa.PrivateKey, chain?: forge.pki.Certificate[]): DecryptedJWK {
    return {
      kty: 'RSA',
      n: hexToBase64Url(pksc1.n.toString(16)),
      e: hexToBase64Url(pksc1.e.toString(16)),
      alg: 'RS256',
      ...(chain?.length ? {
        x5c: chain.map(c => {
          const der = forge.asn1.toDer(forge.pki.certificateToAsn1(c)).getBytes();
          return forge.util.encode64(der);
        })
      } : {})
    } satisfies DecryptedJWK;
  }

  async #fileToCertificate(file: File, pass: string) {
    const binary = byteToBin(new Uint8Array(await file.arrayBuffer()));
    const errors: string[] = [];

    // Try strict modes and to strip MAC if decrypt keeps failing
    for (const strict of [false, true]) {
      for (const stripMac of [false, true]) {
        try {
          let asn1 = forge.asn1.fromDer(binary, strict);
          if (stripMac && Array.isArray(asn1.value) && asn1.value.length > 2) {
            asn1 = {...asn1, value: asn1.value.slice(0, 2)};
          }
          return forge.pkcs12.pkcs12FromAsn1(asn1, strict, pass);
        } catch (e: any) {
          errors.push(`strict=${strict}, stripMac=${stripMac}: ${e?.message ?? e}`);
        }
      }
    }

    throw new Error(`Failed to decrypt PKCS#12:\n${errors.join('\n')}`);
  }

  /* // AI suggestion to simplify A LOT OF BS, but need testing
#extractX509Chain(p12: forge.pkcs12.Pkcs12Pfx) {
const certs = (p12.getBags({ bagType: forge.pki.oids.certBag })[
  forge.pki.oids.certBag
] ?? []).map(b => b.cert as forge.pki.Certificate);

if (!certs.length) throw new Error('No certificates');

const chain: forge.pki.Certificate[] = [certs[0]];
let current = certs[0];

while (true) {
  const issuer = certs.find(
    c => c.subject.hash === current.issuer.hash && c !== current
  );
  if (!issuer) break;
  chain.push(issuer);
  current = issuer;
}

return chain;
}
 */
  #extractX509Chain(cert_p12: forge.pkcs12.Pkcs12Pfx, privateKey?: forge.pki.rsa.PrivateKey) {
    const certBags = cert_p12.getBags({bagType: forge.pki.oids['certBag']});
    const allBags = certBags[forge.pki.oids["certBag"]] || [];

    // 1. Deduplicate by Fingerprint
    const uniqueCertsMap: Record<string, forge.pki.Certificate> = {};
    allBags.forEach(bag => {
      const cert = bag.cert as forge.pki.Certificate;
      const md = forge.md.sha1.create();
      md.update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes());
      uniqueCertsMap[md.digest().toHex()] = cert;
    });

    const uniqueCerts = Object.values(uniqueCertsMap);
    if (!uniqueCerts?.length) throw new Error("No certificates found in the PKCS#12 file.");

    // 2. Identify the leaf
    // If we have a private key, the leaf is the one that matches its public key
    const leaf = this.#findLeaf(uniqueCerts, privateKey);

    const chain: forge.pki.Certificate[] = [leaf];
    let current = leaf;

    // 3. Build the chain (Leaf -> Intermediate -> Root)
    // Limits safely to 10 to avoid infinite loops in case of weird circular certs
    // TODO this is fucking BRAIN DEAD LOGIC FIX ASAP
    for (let i = 0; i < 100; i++) {
      const issuer = uniqueCerts
        .find(c => c !== current && c.subject.hash === current.issuer.hash);
      if (issuer) {
        chain.push(issuer);
        current = issuer;
        // If Root (self-signed), stop
        if (current.subject.hash === current.issuer.hash) break;
      } else {
        break;
      }
    }

    return chain;
  }

  #findLeaf(certs: forge.pki.Certificate[], pKey?: forge.pki.rsa.PrivateKey) {
    let leaf: forge.pki.Certificate | undefined;
    if (pKey) {
      const n = pKey.n.toString(16);
      const e = pKey.e.toString(16);
      leaf = certs // TODO as any fucking stupid hack
        .find(c => (c.publicKey as any).n?.toString(16) === n
          && (c.publicKey as any).e?.toString(16) === e);
    }
    // Fallback: the one that is NOT an issuer of any other (leaf-ish)
    if (!leaf) {
      leaf = certs.find(c => !certs.some(other => other !== c && other.issuer.hash === c.subject.hash));
    }

    // Secondary fallback
    if (!leaf) leaf = certs[0];
    return leaf;
  }
}
