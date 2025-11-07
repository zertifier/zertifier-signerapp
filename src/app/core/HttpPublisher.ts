import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, forkJoin, map, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {DidInputData} from './GithubPublisher';


@Injectable({providedIn: 'root'})
export class FilePublisherService {
  #httpClient = inject(HttpClient);
  #zertifierFileApiUrl = environment.zertifierFileApiUrl || (() => {throw new Error("Zertifier File API URL not configured")})();
  #zertifierProxyFileApiUrl = environment.zertifierProxyFileApiUrl || (() => {throw new Error("Zertifier File API URL not configured")})();
  #zertifierFileApiToken = environment.zertifierFileApiToken || (() => {throw new Error("Zertifier File API Token not configured")})();

  publish(files: ZertifierPublishFileApiModel[],
          url: string = this.#zertifierProxyFileApiUrl ,
          token: string = this.#zertifierFileApiToken ) {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.#httpClient.post(url, files, {headers}).pipe(
      catchError(err => {
        console.error('Error publishing files:', err);
        return throwError(() => err);
      })
    );
  }

  // Build the public URL for a given file path using the same base used in validation
  buildFileUrl(path: string, baseUrl: string = this.#zertifierFileApiUrl): string {
    return `${baseUrl}/${path}`;
  }

  validateFiles(files: ZertifierPublishFileApiModel[], baseUrl: string = this.#zertifierFileApiUrl) {
    const validations = files.map(file =>
      this.#validateContent(`${baseUrl}/${file.path}`, file.content).pipe(
        tap(isValid => {
          if (!isValid) console.error(`❌ Validation failed for file: ${file.path}`);
        })
      )
    );

    return forkJoin(validations).pipe(
      map(results => results.every(r => r)),
      catchError(err => {
        console.error('❌ One or more validations failed:', err);
        return throwError(() => err);
      })
    );
  }

  #validateContent(url: string, content: string) {
    return this.#httpClient.get(url, {responseType: 'text'}).pipe(
      map(resp => {
        console.log("Validating: ", url, resp, content)
        return resp === content
      }),
      catchError(err => {
        console.error(`❌ Network error validating ${url}:`, err);
        return throwError(() => err);
      })
    );
  }

  buildDid(inputData: DidInputData) {
    const verificationMethodId = `${inputData.idDid}#${inputData.verificationMethodId || 'verification'}`;
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
      ],
      'id': inputData.idDid,
      'verificationMethod': [
        {
          'id': verificationMethodId,
          'type': 'JsonWebKey2020',
          'publicKeyJwk': {
            'kty': inputData.kty || 'RSA',
            'n': inputData.publicKey_n,
            'e': inputData.publicKey_e || 'AQAB',
            'alg': inputData.alg || 'RS256',
            'x5u': inputData.certificateUrl_x5u,
          },
        },
      ],
      'assertionMethod': [
        verificationMethodId,
      ],
      'authentication': [
        verificationMethodId,
      ]
    };
  }
}

export interface ZertifierPublishFileApiModel {
  path: string;
  content: string;
}
