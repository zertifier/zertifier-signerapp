import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, throwError} from 'rxjs';
import {VerifiableCredentialV1} from './CredentialsBuilder';

export enum ClearingHouses {
  GAIA_X_V1_TEST = 'GAIA_X_V1_TEST',
  ARSYS_V1 = 'ARSYS_V1',
  DELTA_DAO = "DELTA_DAO",
  ARUBA = "ARUBA",
}

export type VerifiablePresentation = VerifiableCredentialV1 & { verifiableCredential: VerifiableCredentialV1[] }

export interface LegalRegistrationNumberInputData {
  vatId: string;
  url: string;
}

export interface VerifiablePresentationInputData {
  verifiablePresentation: VerifiablePresentation;
  url: string;
}

@Injectable({providedIn: 'root'})
export class ClearingHouseApiService {
  #httpClient = inject(HttpClient);
  clearingHousesCredentialsOfferUrl: Record<ClearingHouses, string> = {
    GAIA_X_V1_TEST: "https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers",
    ARSYS_V1: "https://gx-compliance.arsys.es/v1/api/credential-offers",
    DELTA_DAO:"/delta_dao_offer",
    ARUBA:"https://gx-compliance.aruba.it/v1/api/credential-offers",
  }

  // We using proxy for some of the endpoints because of CORS issues, look at proxy.conf.json
  clearingHousesRegistrationNumberUrl: Record<ClearingHouses, string> = {
    GAIA_X_V1_TEST: '/gaia_lnr/registrationNumberVC',
    ARSYS_V1:"/arsys_lnr/registrationNumberVC",
    DELTA_DAO:"https://www.delta-dao.com/notary/v1/registrationNumberVC",
    ARUBA:"https://gx-notary.aruba.it/v1/registrationNumberVC"
  }

  getLegalRegistrationNumber(registrationNumberInputData: LegalRegistrationNumberInputData, clearingHouse: ClearingHouses = ClearingHouses.GAIA_X_V1_TEST) {
    return this.#fetch(
      this.clearingHousesRegistrationNumberUrl[clearingHouse],
      new HttpParams().set("vcid", registrationNumberInputData.url),
      {
        '@context': [
          'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/participant',
        ],
        type: 'gx:legalRegistrationNumber',
        id: `${registrationNumberInputData.url}#subject`,
        'gx:vatID': registrationNumberInputData.vatId,
      })
  }

  offerVerifiablePresentation(verifiablePresentationInputData: VerifiablePresentationInputData, clearingHouse: ClearingHouses = ClearingHouses.GAIA_X_V1_TEST) {
    return this.#fetch(
      this.clearingHousesCredentialsOfferUrl[clearingHouse],
      new HttpParams().set("vcid", verifiablePresentationInputData.url),
      verifiablePresentationInputData.verifiablePresentation)
  }

  #fetch(url: string, params?: HttpParams, body?: Object) {
    return this.#httpClient.post(url, body, {params}).pipe(
      map((res) => {
        console.log('Fetched data:', res);
        return res;
      }),
      catchError((err) => {
        console.error('Error fetching data:', err);
        return throwError(() => new Error('Api request failed!', {cause: err}));
      })
    );
  }
}
