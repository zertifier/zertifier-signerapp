import {effect, inject, Injectable, signal} from '@angular/core';
import {CertificateInfo, JoseJsonWebKey} from '../types/crypto.types';
import {CryptographyService} from '../services/CryptographyService';


@Injectable()
export class CertificateProvider {
  privateKey = signal<CryptoKey | null>(null);
  publicKeyJwk = signal<JoseJsonWebKey | null>(null);
  pemCert = signal<string | null>(null);
  certificateInfo = signal<CertificateInfo | null>(null);
  certificateFile = signal<File | null>(null);
  certificatePassword = signal<string | null>(null);
  #cryptoService = inject(CryptographyService);

  constructor() {
    effect(() => {
      this.publicKeyJwk() && console.log('publicKeyJwk:', this.publicKeyJwk());
    });
    effect(() => {
      this.publicKeyJwk() && console.log("pemCert: ", this.pemCert());
    });
  }

  clear(): void {
    this.#clearCertificateData();
    this.#clearCertificateFile()
  }

  async decrypt() {
    const file = this.certificateFile();
    const pass = this.certificatePassword();
    if (!file || !pass) {
      throw new Error('Certificate file and password are required.');
    }

    const certData = await this.#cryptoService.decrypt(file, pass);

    this.#clearCertificateData();

    this.privateKey.set(certData.pKey);
    this.publicKeyJwk.set(certData.pubKey);
    this.pemCert.set(certData.pemCert);
    this.certificateInfo.set(certData.certInfo);
  }

  /**
   * Update the x5u (certificate URL) in the public key JWK.
   * This should be called after decryption to set the correct certificate URL.
   */
  updateCertificateUrl(certUrl: string) {
    if (this.publicKeyJwk()) {
      this.publicKeyJwk.update(jwk => ({
        ...jwk,
        x5u: certUrl
      }));
    }
  }

  #clearCertificateFile() {
    this.certificateFile.set(null);
    this.certificatePassword.set(null);
  }

  #clearCertificateData() {
    this.privateKey.set(null);
    this.publicKeyJwk.set(null);
    this.pemCert.set(null);
    this.certificateInfo.set(null);
  }
}
