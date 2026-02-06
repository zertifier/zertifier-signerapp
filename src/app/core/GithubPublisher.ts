import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/*
  Github rate limit, approx: 5000 request per hour per token
  https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28
  Documentation:
  https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#create-or-update-file-contents
*/
@Injectable({ providedIn: 'root' })
export class GithubFileUploadService {
  private apiBase = 'https://api.github.com';
  #httpClient = inject(HttpClient);

  uploadFileToRepo(
    token: string,
    repoOwner: string,
    repoName: string,
    filePath: string,
    content: string,
    message: string,
  ): Observable<any> {
    // example url: https://github.com/zertifier/zertifier-vc-presentation-dev/blob/main/signerAppTest/did.json
    const url = `${this.apiBase}/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const headers = new HttpHeaders({
      Authorization: `token ${token}`,
      // docs: "Setting to application/vnd.github+json is recommended."
      Accept: 'application/vnd.github+json',
    });

    const body = {
      message,
      // docs: "The new file content, using Base64 encoding."
      content: btoa(content),
    };

    // Success codes are: 200(ok), 201(created)
    // Fail codes: 404, 409(conflict), 422(Validation failed/spammed)
    return this.#httpClient.put(url, body, { headers });
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
            'x5c': inputData.certificateChain_x5c,
          },
        },
      ],
      'assertionMethod': [
        verificationMethodId,
      ],
    };
  }
}

export interface DidInputData {
  idDid: string;
  certificateUrl_x5u: string;
  /** X.509 certificate chain (JWK `x5c`) */
  certificateChain_x5c?: string[];
  publicKey_n: string;
  publicKey_e?: string;
  alg?: string;
  kty?: string;
  verificationMethodId?: string;
}
