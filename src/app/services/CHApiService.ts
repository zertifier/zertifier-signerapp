import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  EMPTY,
  finalize,
  from,
  Observable,
  shareReplay,
  take,
  throwError
} from 'rxjs';
import {ClearingHouseRepo} from '../data/ClearingHouseRepo';
import {ApprovedCHs, CHServices} from '../types/clearingHouse.types';

@Injectable({providedIn: 'root'})
export class CHApiService {
  #chRepo = inject(ClearingHouseRepo);
  #httpClient = inject(HttpClient);
  #inFlight: Record<string, Observable<any>> = {};

  offer(offer: Object, vcid: string, service: CHServices, ch?: ApprovedCHs) {
    const key = JSON.stringify({offer, vcid, service, ch})
    if (!this.#inFlight[key]) {
      this.#inFlight[key] = this.#postWithFallback(
        this.#chRepo.getAllUrls(service, ch),
        offer,
        new HttpParams().set("vcid", vcid))
        .pipe(
          shareReplay(1),
          finalize(() => delete this.#inFlight[key])
        )
    }
    return this.#inFlight[key]
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
