import {effect, Injectable, signal} from '@angular/core';
import {VerifiablePresentation} from './ClearingHouseApiService';


export interface VerifiableCredentialV1{
  "@context": string[] | string;
  "type"?: string[] | string;

  [key: string]: any;
}

export interface TermsAndConditionsInputData {
  url: string;
}

export interface LegalParticipantInputData {
  url: string;
  legalRegistrationNumberSubjectUrl: string;
  countryCode: string;
  legalName: string;
}

const LEGAL_PARTICIPANT_TEMPLATE = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": [
    "VerifiableCredential"
  ],
  // "id": "https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/legalParticipant.json",
  // "issuer": "did:web:raw.githubusercontent.com:zertifier:zertifier-vc-presentation-dev:main:signerAppTest",
  // "issuanceDate": "2025-10-20T12:06:28.816Z",
  "credentialSubject": {
    // "gx:legalName": "ZertiPuperti",
    // "gx:headquarterAddress": {
    //   "gx:countrySubdivisionCode": "ES-CT"
    // },
    // "gx:legalRegistrationNumber": {
    //   "id": "https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/legalRegistrationNumber.json#subject"
    // },
    // "gx:legalAddress": {
    //   "gx:countrySubdivisionCode": "ES-CT"
    // },
    "type": "gx:LegalParticipant",
    // "id": "https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/legalParticipant.json#subject"
  }
}

const TERMS_AND_CONDITIONS_TEMPLATE = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": "VerifiableCredential",
  // "issuanceDate": "2025-10-20T12:06:28.816Z",
  "credentialSubject": {
    "gx:termsAndConditions": "The PARTICIPANT signing the Self-Description agrees as follows:\n- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n\nThe keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD).",
    "type": "gx:GaiaXTermsAndConditions",
    // "id": "https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/termsAndConditions.json#subject"
  },
  // "issuer": "did:web:raw.githubusercontent.com:zertifier:zertifier-vc-presentation-dev:main:signerAppTest",
  // "id": "https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/termsAndCondition.json"
}


@Injectable({providedIn: "root"})
export class CredentialsBuilder{
  buildVerifiablePresentation(verifiableCredential: VerifiableCredentialV1[]): VerifiablePresentation{
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
      ],
      "type": "VerifiablePresentation",
      "verifiableCredential": verifiableCredential
    }
  }
  buildTermsAndConditions(didUrl: string, inputData: TermsAndConditionsInputData){
    if(!didUrl || !inputData) throw new Error("Cant build credentials, received empty data!!!")
    return {
      ...TERMS_AND_CONDITIONS_TEMPLATE,
      "id": inputData.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...TERMS_AND_CONDITIONS_TEMPLATE.credentialSubject,
        "id": `${inputData.url}#subject`
      },
    }
  }

  buildLegalParticipant(didUrl: string, inputData: LegalParticipantInputData){
    if(!didUrl || !inputData) throw new Error("Cant build credentials, received empty data!!!")
    return {
      ...LEGAL_PARTICIPANT_TEMPLATE,
      "id": inputData.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...LEGAL_PARTICIPANT_TEMPLATE.credentialSubject,
        "gx:legalName": inputData.legalName,
        "gx:headquarterAddress": {
          "gx:countrySubdivisionCode": inputData.countryCode
        },
        "gx:legalAddress": {
          "gx:countrySubdivisionCode": inputData.countryCode
        },
        "gx:legalRegistrationNumber": {
          "id": `${inputData.legalRegistrationNumberSubjectUrl}`
        },
        "id": `${inputData.url}#subject`
      },
    }
  }
}
