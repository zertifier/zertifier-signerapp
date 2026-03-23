import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, map, switchMap} from 'rxjs';

/**
 * This will not work because of CORS and HTTPS dogshit
 */
@Injectable({providedIn: 'root'})
export class HashService {
  private http = inject(HttpClient);

  async getUrlHash(url: string) {
    return this.http.get(url, {responseType: 'arraybuffer'}).pipe(
      switchMap(buffer => from(crypto.subtle.digest('SHA-256', buffer))),
      map(hashBuffer => this.bufferToHex(hashBuffer))
    )
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
