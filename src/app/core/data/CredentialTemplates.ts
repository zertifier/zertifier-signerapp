export const LP_TEMPLATE = {
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

export const TAC_TEMPLATE = {
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

export const VP_TEMPLATE = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
  ],
  "type": "VerifiablePresentation",
  //"credential": verifiableCredential
}

export const SO_TEMPLATE = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": "VerifiableCredential",
  "credentialSubject": {
    "type": "gx:ServiceOffering",
  }
}
