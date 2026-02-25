import {effect, inject, Injectable, signal} from '@angular/core';
import {DecryptedCertificate} from '../types/crypto.types';
import {CryptographyService} from '../services/cryptography/CryptographyService';


@Injectable()
export class CertificateProvider {
  decryptedCertificate = signal<DecryptedCertificate | null>(null);
  certificateFile = signal<File | null>(null);
  certificatePassword = signal<string | null>(null);
  #cryptoService = inject(CryptographyService);

  constructor() {
    effect(() => {
      this.decryptedCertificate() && console.log(
        `publicKeyJwk:`, this.decryptedCertificate()?.pubKey,
        `Pem: `, this.decryptedCertificate()?.pemCert);
    });
  }

  clear(): void {
    this.certificateFile.set(null);
    this.certificatePassword.set(null);
    this.decryptedCertificate.set(null);
  }

  async decrypt() {
    const file = this.certificateFile();
    const pass = this.certificatePassword();
    if (!file || !pass) {
      throw new Error('Certificate file and password are required.');
    }
    this.decryptedCertificate.set(await this.#cryptoService.decrypt(file, pass));
  }

  /**
   * Update the x5u (certificate URL) in the public key JWK.
   * This should be called after decryption to set the correct certificate URL.
   */
  updateCertificateUrl(certUrl: string) {
    const cert = this.decryptedCertificate();
    if (cert && cert.pubKey) {
      cert.pubKey.x5c = [...(cert.pubKey.x5c ?? []), certUrl];
      this.decryptedCertificate.set(cert);
    }
  }
}
