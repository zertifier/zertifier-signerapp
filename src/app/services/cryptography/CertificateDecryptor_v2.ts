import {inject, Injectable} from '@angular/core';
import forge from 'node-forge';
import {hexToBase64Url} from '../../util/strings.util';
import {CertificateBuilder} from './CertificateBuilder';
import {CertificateDecryptor, DecryptedCertificate, DecryptedJWK} from '../../core/types/crypto.types';


@Injectable({providedIn: "root"})
export class CertificateDecryptor_v2 implements CertificateDecryptor {
  #builder = inject(CertificateBuilder);

  async decrypt(file: File, password: string): Promise<DecryptedCertificate> {
    // 1) Extracting data from the file
    const cert = await this.#extractPKCS12(file, password);
    const keyBag = this.#extractPKCS1(cert);
    const chain = this.#extractX509Chain(cert);

    // 3) formating certificate to required format
    const pKey = await this.#pKeyImport(keyBag);
    const pubKey = this.#buildJwk(keyBag, chain);
    const pemCert = chain.map(c => forge.pki.certificateToPem(c)).join('\n');
    const certInfo = this.#builder.build(chain[0]);

    if (!(pKey && pubKey && pemCert && certInfo)) {
      throw new Error('Not all data extracted - abunden the ship!')
    }

    return {
      pKey,
      pubKey,
      pemCert,
      certInfo
    } satisfies DecryptedCertificate;
  }

  async #pKeyImport(pksc1: forge.pki.rsa.PrivateKey){
    try{
      const jwk = this.#PKSC1ToJWK(pksc1);
      return await this.#jwkToCryptoKey(jwk)
    } catch (e: any){
      console.error("Failed to import private key from JWK, fallback to PKSC8!")
    }
    try{
      return await this.#PKSC1toCryptoKey(pksc1);
    }catch (e) {
      throw new Error("Failed to import private key from PKSC8!")
    }
  }

  decodeBase64(encoded: string): Uint8Array {
    if ((Uint8Array as any).fromBase64) {
      return (Uint8Array as any).fromBase64(encoded);
    }

    // fallback
    return Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  }

  // Helper to safely convert JSBN BigInteger to Base64Url
  #bigIntToBase64Url(bigInt: any): string {
    // Use toString(16) to get the hex
    let hex = bigInt.toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex;

    // Convert to a Uint8Array first so we can easily trim leading zeros
    const bytes = forge.util.hexToBytes(hex);
    const uint8 = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) uint8[i] = bytes.charCodeAt(i);

    // FIND THE FIRST NON-ZERO BYTE (Trimming leading zeros)
    let start = 0;
    while (start < uint8.length - 1 && uint8[start] === 0) {
      start++;
    }
    const trimmed = uint8.slice(start);

    // Convert back to Forge's binary string format for encoding
    const binaryString = String.fromCharCode.apply(null, Array.from(trimmed));

    return forge.util.encode64(binaryString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  #PKSC1ToJWK(pksc1: forge.pki.rsa.PrivateKey){
   return {
      kty: 'RSA',
      n: this.#bigIntToBase64Url(pksc1.n),
      e: this.#bigIntToBase64Url(pksc1.e),
      d: this.#bigIntToBase64Url(pksc1.d),
      p: this.#bigIntToBase64Url(pksc1.p),
      q: this.#bigIntToBase64Url(pksc1.q),
      dp: this.#bigIntToBase64Url(pksc1.dP),
      dq: this.#bigIntToBase64Url(pksc1.dQ),
      qi: this.#bigIntToBase64Url(pksc1.qInv),
      alg: 'RS256',
      ext: true,
    };
  }

  #jwkToCryptoKey(jwk: any){
    try {
      return crypto.subtle.importKey(
        `jwk`,
        jwk,
        {name: 'RSASSA-PKCS1-v1_5', hash: `SHA-256`},
        true,
        ['sign']);
    } catch (e) {
      console.error("Error decrypting manually", e);
      throw e;
    }
  }

  #PKSC1toCryptoKey(pksc1: forge.pki.rsa.PrivateKey) {
    const rsaAsn1 = forge.pki.privateKeyToAsn1(pksc1);
    const pkcs8Asn1 = forge.pki.wrapRsaPrivateKey(rsaAsn1);
    const derString = forge.asn1.toDer(pkcs8Asn1).getBytes();
    const derBuffer = new Uint8Array(derString.length);
    for (let i = 0; i < derString.length; i++) {
      derBuffer[i] = derString.charCodeAt(i);
    }

    try {
      return crypto.subtle.importKey(
        `pkcs8`,
        derBuffer.buffer,
        {name: 'RSASSA-PKCS1-v1_5', hash: `SHA-256`},
        // {name: 'RSA-PSS', hash: `SHA-256`},
        true,
        ['sign']);
    } catch (e) {
      console.error("Error decrypting manually", e);
      throw e;
    }
  }

  #extractPKCS1(pkcs12: forge.pkcs12.Pkcs12Pfx) {
    const pkcs1 = (pkcs12.getBags(
      {bagType: forge.pki.oids['pkcs8ShroudedKeyBag']}))[forge.pki.oids["pkcs8ShroudedKeyBag"]]?.[0].key;
    if (!pkcs1) throw new Error("Key in the certificated not found!!!");
    return pkcs1;
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

  async #extractPKCS12(file: File, password: string) {
    return forge.pkcs12.pkcs12FromAsn1(
      forge.asn1.fromDer(
        forge.util.createBuffer(
          await file.arrayBuffer())),
      password);
  }

  #extractX509Chain(cert_p12: forge.pkcs12.Pkcs12Pfx) {
    const certBags = cert_p12.getBags(
      {bagType: forge.pki.oids['certBag']})
      [forge.pki.oids["certBag"]]
      ?.map(bag => bag.cert as forge.pki.Certificate);
    if (!certBags) {
      throw new Error("No Certificate data extracted, abunden the ship!");
    }
    return certBags;
  }
}
