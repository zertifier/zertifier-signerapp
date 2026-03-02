import {inject, Injectable} from '@angular/core';
import {CryptographyService} from '../services/cryptography/CryptographyService';
import {DecryptedCertificate} from './types/crypto.types';


@Injectable()
export class CertificateProvider {
  #cryptoService = inject(CryptographyService);

  async decrypt(file: File, pass: string) {
    if (!file || !pass) {
      throw new Error('Certificate file and password are required.');
    }
    return await this.#cryptoService.decrypt(file, pass);
  }

  /**
   * Update the x5u (certificate URL) in the public key JWK.
   * This should be called after decryption to set the correct certificate URL.
   */
  updateCertificateUrl(cert: DecryptedCertificate, certUrl: string) {
    if (cert && cert.pubKey) {
      cert.pubKey.x5c = [...(cert.pubKey.x5c ?? []), certUrl];
    }
  }
}
