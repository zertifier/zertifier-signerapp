import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, concatMap, defaultIfEmpty, EMPTY, from, take, throwError} from 'rxjs';
import {ClearingHouseRepo} from '../data/ClearingHouseRepo';
import {ApprovedCHs, CHServices} from '../types/clearingHouse.types';

@Injectable({providedIn: 'root'})
export class ClearingHouseApiService {
  #chRepo = inject(ClearingHouseRepo);
  #httpClient = inject(HttpClient);

  offer(offer: Object, vcid: string, service: CHServices, ch?: ApprovedCHs) {
    return this.#postWithFallback(
      this.#chRepo.getAllUrls(service, ch),
      offer,
      new HttpParams().set("vcid", vcid))
  }

  #postWithFallback(urls: string[], body: object, params?: HttpParams) {
    return from(urls).pipe(
      concatMap(url =>
        this.#httpClient.post(url, body, {params}).pipe(
          catchError(() => EMPTY) // swallow error, try next
        )
      ),
      take(1), // first success wins
      defaultIfEmpty(
        throwError(() => new Error('All clearing houses failed'))
      )
    );
  }
}
