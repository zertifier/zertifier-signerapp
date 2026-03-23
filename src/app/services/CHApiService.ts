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
import {ClearingHouseRepo} from '../core/data/ClearingHouseRepo';
import {ApprovedCHs, CHServices} from '../core/types/clearingHouse.types';

@Injectable({providedIn: 'root'})
export class CHApiService {
  #chRepo = inject(ClearingHouseRepo);
  #httpClient = inject(HttpClient);
  #inFlight: Record<string, Observable<any>> = {};

  fetch(body: Object, params: HttpParams, service: CHServices, ch?: ApprovedCHs) {
    const key = JSON.stringify({body, params, service, ch})
    if (!this.#inFlight[key]) {
      this.#inFlight[key] = this.#postWithFallback(
        this.#chRepo.getAllUrls(service, ch),
        body,
        params)
        .pipe(
          shareReplay(1),
          finalize(() => delete this.#inFlight[key])
        )
    }
    return this.#inFlight[key]
  }

  fetch_lnr_v2(vatId: string, params: HttpParams, ch?: ApprovedCHs) {
    const key = JSON.stringify({vatId, params, service: "LNR_V2", ch})
    if (!this.#inFlight[key]) {
      this.#inFlight[key] = this.#postWithFallback(
        this.#chRepo.getAllUrls("LNR_V2", ch).map(u => u + "/vatId"),
        {},
        params)
        .pipe(
          shareReplay(1),
          finalize(() => delete this.#inFlight[key])
        )
    }
    return this.#inFlight[key]
  }

  #postWithFallback(urls: string[], body: object, params: HttpParams) {
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
