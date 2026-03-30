import {inject, Injectable} from '@angular/core';
import {CertificateDecryptor_v2} from './CertificateDecryptor_v2';

@Injectable({providedIn: "root"})
export class CryptographyService {
  #decryptor = inject(CertificateDecryptor_v2);

  async decrypt(file: File, pass: string) {
    return this.#decryptor.decrypt(file, pass);
  }
}
