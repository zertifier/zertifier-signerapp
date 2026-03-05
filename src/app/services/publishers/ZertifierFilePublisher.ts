import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, forkJoin, ignoreElements, map, switchMap, throwError} from 'rxjs';
import {FilePublisher, PublishedFile} from '../../core/types/publisher.types';
import {joinPath} from '../../util/strings.util';

/**
 * Publish generated credentials to some server
 */
@Injectable({providedIn: 'root'})
export class ZertifierFilePublisher implements FilePublisher {
  #http = inject(HttpClient);

  publish(url: string, files: PublishedFile[], headers?: HttpHeaders) {
    return this.#http.post(url, files, {headers})
      .pipe(
        switchMap(() => this.validate(url, files)),
        catchError((err: any) =>
          throwError(() => new Error(`Error publishing files`, {cause: err}))
        )
      );
  }

  /**
   * run validator on all files
   * @param files
   * @param baseUrl
   */
  validate(baseUrl: string, files: PublishedFile[]) {
    return forkJoin(
      files.map(file =>
        this.#validateContent(
          joinPath(baseUrl, file.path),
          file.content
        )
      )
    ).pipe(
      ignoreElements()
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
      map(resp => {
        if (resp === content) {
          throw new Error(`File content doesnt match`)
        }
      }),
      catchError((err: any) =>
        throwError(() => new Error(`Validation fail. url: ${url}`, {cause: err}))
      )
    );
  }
}


