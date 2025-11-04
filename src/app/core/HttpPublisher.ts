import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, forkJoin, map, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment';


@Injectable({providedIn: 'root'})
export class FilePublisherService {
  #httpClient = inject(HttpClient);
  #zertifierFileApiUrl = environment.zertifierFileApiUrl || (() => {throw new Error("Zertifier File API URL not configured")})();
  #zertifierFileApiToken = environment.zertifierFileApiToken || (() => {throw new Error("Zertifier File API Token not configured")})();

  publish(files: ZertifierPublishFileApiModel[],
          url: string = this.#zertifierFileApiUrl ,
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
}

export interface ZertifierPublishFileApiModel {
  path: string;
  content: string;
}
