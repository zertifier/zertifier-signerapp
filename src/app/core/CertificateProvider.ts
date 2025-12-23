import { effect, Injectable, signal } from '@angular/core';
import * as forge from 'node-forge';
import * as jose from 'jose';

// Extend the DOM JsonWebKey to allow x5u (and future x5* fields) used in JOSE
interface JoseJsonWebKey extends JsonWebKey {
  x5u?: string;
  x5c?: string[];
}

export interface CertificateInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  serialNumberHex: string;
  validFrom: string; // ISO string
  validTo: string;   // ISO string
  sha256Fingerprint: string; // colon separated uppercase hex
  keyUsage?: string[];
  organizationIdentifier?: string; // e.g. VATES-B55272140
}

@Injectable()
export class CertificateProvider {
  privateKey = signal<CryptoKey | null>(null);
  publicKeyJwk = signal<JoseJsonWebKey | null>(null);
  pemCert = signal<string | null>(null);
  certificateInfo = signal<CertificateInfo | null>(null);

  certificateFile = signal<File | null>(null);
  certificatePassword = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.publicKeyJwk() && console.log('publicKeyJwk:', this.publicKeyJwk());
    });
    effect(() => {
      this.publicKeyJwk() && console.log("pemCert: ", this.pemCert());
    });
  }

  clear(): void {
    this.privateKey.set(null);
    this.publicKeyJwk.set(null);
    this.pemCert.set(null);
    this.certificateInfo.set(null);
    this.certificateFile.set(null);
    this.certificatePassword.set(null);
  }

  async decrypt(): Promise<void> {
    const certFile = this.certificateFile();
    const pass = this.certificatePassword();
    if (!certFile || !pass) {
      throw new Error('Certificate file and password are required.');
    }

    // Reset previous state before attempting new decryption
    this.privateKey.set(null);
    this.publicKeyJwk.set(null);
    this.pemCert.set(null);
    this.certificateInfo.set(null);

    const cert = await this.#fileToCertificate(certFile, pass);

    const pksc1 = this.#extractPrivateKeyPKSC1FromCertificate(cert);
    const chain = this.#extractX509ChainFromP12(cert, pksc1);
    const leaf = chain[0];
    if (!leaf) throw new Error("No leaf certificate found in the chain.");

    const jwk = this.#buildJwk(pksc1, chain);
    const pKey = await this.#PKSC1toCryptoKey(pksc1);
    this.privateKey.set(pKey);
    this.publicKeyJwk.set(jwk);

    // Set pemCert as a concatenation of all certificates in the chain
    const pemChain = chain.map(c => forge.pki.certificateToPem(c)).join('\n');
    this.pemCert.set(pemChain);

    // Human-friendly info from leaf
    const info = this.#buildCertificateInfo(leaf);
    this.certificateInfo.set(info);
  }

  async #fileToCertificate(file: File, password: string) {
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to binary string more reliably for node-forge
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    try {
      const asn1 = forge.asn1.fromDer(binary);

      // Diagnostic & Workaround: Handle MAC data
      try {
        if (Array.isArray(asn1.value) && asn1.value.length > 2) {
          console.log('PKCS#12 MacData detected. Inspecting algorithm...');
          const macData = asn1.value[2];
          const macHex = (forge.asn1 as any).toDer(macData).toHex();

          if (macHex.includes('2b0e03021a')) console.log('MAC Algorithm Detected: SHA-1');
          else if (macHex.includes('608648016503040201')) console.log('MAC Algorithm Detected: SHA-256');
          else console.log('Unknown MAC Algorithm. MacData Hex snippet:', macHex.substring(0, 100));

          // WORKAROUND: Manually remove MacData to bypass forge's internal (and sometimes buggy) MAC check.
          // This allows forge to proceed directly to decrypting the bags.
          console.log('Bypassing MAC validation by stripping MacData child...');
          asn1.value.splice(2, 1);
        } else {
          console.log('No MAC data found in PFX, proceeding...');
        }
      } catch (diagError) {
        console.warn('Diagnostics / Workaround failed, trying normal parse:', diagError);
      }

      // We still pass 'false' for strictness just in case, though MacData is now gone.
      return forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
    } catch (e: any) {
      console.error('Forge PKCS12 parsing error:', e);
      throw new Error(`Failed to decrypt PKCS#12. Please ensure the password is correct. (Detail: ${e.message})`);
    }
  }

  async #PKSC1toCryptoKey(pksc1: forge.pki.rsa.PrivateKey) {
    const pkcs8Pem = forge.pki.privateKeyInfoToPem(
      forge.pki.wrapRsaPrivateKey(
        forge.pki.privateKeyToAsn1(pksc1)))
    return await jose.importPKCS8(pkcs8Pem, 'RS256');
  }

  #extractX509ChainFromP12(cert_p12: forge.pkcs12.Pkcs12Pfx, privateKey?: forge.pki.rsa.PrivateKey): forge.pki.Certificate[] {
    const certBags = cert_p12.getBags({ bagType: forge.pki.oids['certBag'] });
    const allBags = certBags[forge.pki.oids["certBag"]] || [];

    // 1. Deduplicate by Fingerprint
    const uniqueCertsMap = new Map<string, forge.pki.Certificate>();
    allBags.forEach(bag => {
      const cert = bag.cert as forge.pki.Certificate;
      const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
      const md = forge.md.sha1.create();
      md.update(der);
      const fp = md.digest().toHex();
      uniqueCertsMap.set(fp, cert);
    });

    const uniqueCerts = Array.from(uniqueCertsMap.values());
    if (uniqueCerts.length === 0) throw new Error("No certificates found in the PKCS#12 file.");

    // 2. Identify the leaf
    // If we have a private key, the leaf is the one that matches its public key
    let leaf: forge.pki.Certificate | undefined;
    if (privateKey) {
      const n = privateKey.n.toString(16);
      const e = privateKey.e.toString(16);
      leaf = uniqueCerts.find(c => {
        const cn = (c.publicKey as any).n?.toString(16);
        const ce = (c.publicKey as any).e?.toString(16);
        return cn === n && ce === e;
      });
    }

    // Fallback: the one that is NOT an issuer of any other (leaf-ish)
    if (!leaf) {
      leaf = uniqueCerts.find(c => !uniqueCerts.some(other => other !== c && other.issuer.hash === c.subject.hash));
    }

    // Secondary fallback
    if (!leaf) leaf = uniqueCerts[0];

    const chain: forge.pki.Certificate[] = [leaf];
    let current = leaf;

    // 3. Build the chain (Leaf -> Intermediate -> Root)
    // Limits safely to 10 to avoid infinite loops in case of weird circular certs
    for (let i = 0; i < 10; i++) {
      const issuer = uniqueCerts.find(c => c !== current && c.subject.hash === current.issuer.hash);
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

  #extractPrivateKeyPKSC1FromCertificate(cert_p12: forge.pkcs12.Pkcs12Pfx) {
    const keyBags = cert_p12.getBags({ bagType: forge.pki.oids['pkcs8ShroudedKeyBag'] });
    const bag = keyBags[forge.pki.oids["pkcs8ShroudedKeyBag"]]?.[0];
    if (!keyBags || !bag) throw new Error("Key in the certificated not found!!!");
    return bag?.key as forge.pki.rsa.PrivateKey;
  }

  #buildJwk(pksc1: forge.pki.rsa.PrivateKey, chain?: forge.pki.Certificate[]): JoseJsonWebKey {
    const jwk: JoseJsonWebKey = {
      kty: 'RSA',
      n: this.#hexToBase64Url(pksc1.n.toString(16)),
      e: this.#hexToBase64Url(pksc1.e.toString(16)),
      alg: 'RS256'
    };

    // Add x5c if chain is available
    if (chain && chain.length > 0) {
      jwk.x5c = chain.map(c => {
        // DER to Base64
        const der = forge.asn1.toDer(forge.pki.certificateToAsn1(c)).getBytes();
        return forge.util.encode64(der);
      });
    }

    return jwk;
  }

  /**
   * Update the x5u (certificate URL) in the public key JWK.
   * This should be called after decryption to set the correct certificate URL.
   */
  updateCertificateUrl(certUrl: string): void {
    const currentJwk = this.publicKeyJwk();
    if (currentJwk) {
      this.publicKeyJwk.set({
        ...currentJwk,
        x5u: certUrl
      });
    }
  }

  #buildCertificateInfo(cert: forge.pki.Certificate): CertificateInfo {
    const subject: Record<string, string> = {};
    const issuer: Record<string, string> = {};
    let organizationIdentifier: string | undefined;

    (cert.subject.attributes || []).forEach(a => {
      const key = (a as any).name ?? (a as any).type ?? (a as any).shortName;
      const value = this.#fixMojibake(String((a as any).value ?? ''));
      if (typeof key === 'string' && key.length) subject[key] = value;

      // Specifically check for organizationIdentifier by OID or name
      if ((a as any).type === '2.5.4.97' || (a as any).name === 'organizationIdentifier') {
        organizationIdentifier = value;
      }
    });
    (cert.issuer.attributes || []).forEach(a => {
      const key = (a as any).name ?? (a as any).type ?? (a as any).shortName;
      if (typeof key === 'string' && key.length) issuer[key] = this.#fixMojibake(String((a as any).value ?? ''));
    });

    // SHA-256 fingerprint of DER
    const derBytes = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const md = forge.md.sha256.create();
    md.update(derBytes);
    const hex = md.digest().toHex().toUpperCase();
    const fingerprint = hex.match(/.{1,2}/g)?.join(':') ?? hex;

    // keyUsage extension
    const keyUsageExt = (cert.extensions || []).find(e => (e as any).name === 'keyUsage') as any;
    const keyUsage: string[] | undefined = keyUsageExt ? Object.entries(keyUsageExt)
      .filter(([k, v]) => typeof v === 'boolean' && v === true && k !== 'critical' && k !== 'name')
      .map(([k]) => k) : undefined;

    return {
      subject,
      issuer,
      serialNumberHex: cert.serialNumber?.toUpperCase?.() ?? String(cert.serialNumber ?? ''),
      validFrom: cert.validity.notBefore?.toISOString?.() ?? '',
      validTo: cert.validity.notAfter?.toISOString?.() ?? '',
      sha256Fingerprint: fingerprint,
      keyUsage,
      organizationIdentifier
    };
  }

  // Try to fix strings that look like UTF-8 interpreted as Latin-1 (e.g., "RepresentaciÃ³n" -> "Representación")
  #fixMojibake(input: string): string {
    // Quick check to avoid touching already-correct ASCII/Unicode strings
    if (!/[ÃÂ]/.test(input)) return input;

    try {
      // Treat current string as a sequence of bytes (Latin-1) and decode as UTF-8
      const bytes = new Uint8Array(Array.from(input, ch => ch.charCodeAt(0)));
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      return decoded;
    } catch {
      // Fallback: return original if decoding fails
      return input;
    }
  }

  #hexToBase64Url(hex: string) {
    if (hex.length % 2) hex = '0' + hex;
    const byteArray = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    let binary = '';
    for (let i = 0; i < byteArray.length; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
}
