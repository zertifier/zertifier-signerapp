import {inject, Injectable} from '@angular/core';
import {CertificateDecryptor} from './CertificateDecryptor';

@Injectable({providedIn: "root"})
export class CryptographyService {
  #decryptor = inject(CertificateDecryptor);

  async decrypt(file: File, pass: string) {
    return this.#decryptor.decrypt(file, pass);
  }
}
