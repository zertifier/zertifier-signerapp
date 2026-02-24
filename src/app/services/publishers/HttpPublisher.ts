import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, forkJoin, map, switchMap, tap, throwError} from 'rxjs';
import {FilePublisher, PublishedFile} from '../../types/publisher.types';

/**
 * Publish generated credentials to some server
 */
@Injectable({providedIn: 'root'})
export class BaseFilePublisher implements FilePublisher {
  #http = inject(HttpClient);

  publish(files: PublishedFile[], url: string, headers?: HttpHeaders) {
    return this.#http.post(url, files, {headers})
      .pipe(
        switchMap(() => this.validate(files, url)),
        catchError(err => {
          console.error('Error publishing files:', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * run validator on all files
   * @param files
   * @param baseUrl
   */
  validate(files: PublishedFile[], baseUrl: string) {
    return forkJoin(
      files.map(
        file =>
          this.#validateContent(`${baseUrl}/${file.path}`, file.content)
      ))
      .pipe(
        map(results => {
          const isAllValid = results.every(Boolean);
          if (!isAllValid) {
            throw new Error("❌ Validation failed!")
          }
          return true;
        }),
      );
  }

  /**
   * Check if file content is as expected
   * @param url
   * @param content
   * @private
   */
  #validateContent(url: string, content: string) {
    return this.#http.get(url, {responseType: 'text'}).pipe(
      map(resp => resp === content),
      tap(isValid => {
        if (!isValid) {
          console.error("Validations failed for url: ", url)
        }
      })
    );
  }
}


