import {effect, Injectable, signal} from '@angular/core';
import * as forge from 'node-forge';
import * as jose from 'jose';

// Extend the DOM JsonWebKey to allow x5u (and future x5* fields) used in JOSE
interface JoseJsonWebKey extends JsonWebKey {
  x5u?: string;
}

export interface CertificateInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  serialNumberHex: string;
  validFrom: string; // ISO string
  validTo: string;   // ISO string
  sha256Fingerprint: string; // colon separated uppercase hex
  keyUsage?: string[];
}

@Injectable()
export class CertificateProvider{
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
    const x509 = this.#extractX509CertificateFromP12(cert);
    this.pemCert.set(forge.pki.certificateToPem(x509));

    const pksc1 = this.#extractPrivateKeyPKSC1FromCertificate(cert);
    const jwk = this.#buildJwk(pksc1);
    const pKey = await this.#PKSC1toCryptoKey(pksc1);
    this.privateKey.set(pKey);
    this.publicKeyJwk.set(jwk);

    // Build and store human-friendly certificate info
    const info = this.#buildCertificateInfo(x509);
    this.certificateInfo.set(info);
  }

  async #fileToCertificate(file: File, password: string){
    return forge.pkcs12
      .pkcs12FromAsn1(
        forge.asn1.fromDer(
          forge.util.createBuffer(
            await file.arrayBuffer())), password);
  }

  async #PKSC1toCryptoKey(pksc1: forge.pki.rsa.PrivateKey){
    const pkcs8Pem = forge.pki.privateKeyInfoToPem(
      forge.pki.wrapRsaPrivateKey(
        forge.pki.privateKeyToAsn1(pksc1)))
    return await jose.importPKCS8(pkcs8Pem, 'RS256');
  }

  #extractX509CertificateFromP12(cert_p12: forge.pkcs12.Pkcs12Pfx){
    const certBags = cert_p12.getBags({ bagType: forge.pki.oids['certBag'] });
    const bag = certBags[forge.pki.oids["certBag"]]?.[0];
    if(!certBags || !bag) throw new Error("Certificate in the certificated not found!!!");
    return bag?.cert as forge.pki.Certificate;
  }

  #extractPrivateKeyPKSC1FromCertificate(cert_p12: forge.pkcs12.Pkcs12Pfx){
    const keyBags = cert_p12.getBags({ bagType: forge.pki.oids['pkcs8ShroudedKeyBag'] });
    const bag = keyBags[forge.pki.oids["pkcs8ShroudedKeyBag"]]?.[0];
    if(!keyBags || !bag) throw new Error("Key in the certificated not found!!!");
    return bag?.key as forge.pki.rsa.PrivateKey;
  }

  #buildJwk(pksc1: forge.pki.rsa.PrivateKey): JoseJsonWebKey{
    return {
      kty: 'RSA',
      n: this.#hexToBase64Url(pksc1.n.toString(16)),
      e: this.#hexToBase64Url(pksc1.e.toString(16)),
      alg: 'RS256',
      x5u: "https://www.zertifier.com/docs/signedTest/test/cert.pem"
    };
  }

  #buildCertificateInfo(cert: forge.pki.Certificate): CertificateInfo {
    const subject: Record<string, string> = {};
    const issuer: Record<string, string> = {};
    (cert.subject.attributes || []).forEach(a => {
      const key = (a as any).name ?? (a as any).type ?? (a as any).shortName;
      if (typeof key === 'string' && key.length) subject[key] = String((a as any).value ?? '');
    });
    (cert.issuer.attributes || []).forEach(a => {
      const key = (a as any).name ?? (a as any).type ?? (a as any).shortName;
      if (typeof key === 'string' && key.length) issuer[key] = String((a as any).value ?? '');
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
      keyUsage
    };
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
