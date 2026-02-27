import {Injectable} from '@angular/core';
import {VerifiableCredentialProof} from './SignerService';
import {LP_TEMPLATE, TAC_TEMPLATE, VP_TEMPLATE} from '../data/CredentialTemplates';
import {DIDInput, LPInput, TACInput, VCv1, VP} from '../types/credential.types';

@Injectable({providedIn: "root"})
export class CredentialsBuilder {

  vp(vcArr: VCv1[]): VP {
    return {
      ...VP_TEMPLATE,
      "credential": vcArr
    }
  }

  tac(didUrl: string, inputData: TACInput) {
    if (!didUrl || !inputData) throw new Error("Cant build credentials, received empty data!!!")
    return {
      ...TAC_TEMPLATE,
      "id": inputData.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...TAC_TEMPLATE.credentialSubject,
        "id": `${inputData.url}#subject`
      },
    }
  }

  lp(didUrl: string, inputData: LPInput) {
    if (!didUrl || !inputData) throw new Error("Cant build credentials, received empty data!!!")
    if (!inputData.legalRegistrationNumberSubjectUrl) throw new Error("Legal Registration Number Subject URL is required")
    return {
      ...LP_TEMPLATE,
      "id": inputData.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...LP_TEMPLATE.credentialSubject,
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

  lnrOffer(url: string, vatId: string) {
    return {
      '@context': [
        'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/participant',
      ],
      type: 'gx:legalRegistrationNumber',
      id: `${url}#subject`,
      'gx:vatID': vatId,
    };
  }

  did(input: DIDInput) {
    const verificationMethodId = `${input.id}#${input.verificationMethodId || 'verification'}`;
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
      ],
      'id': input.id,
      'verificationMethod': [
        {
          'id': verificationMethodId,
          'type': 'JsonWebKey2020',
          'publicKeyJwk': {
            'kty': input.kty || 'RSA',
            'n': input.publicKey_n,
            'e': input.publicKey_e || 'AQAB',
            'alg': input.alg || 'RS256',
            'x5u': input.certificateUrl_x5u,
            'x5c': input.certificateChain_x5c,
          },
        },
      ],
      'assertionMethod': [
        verificationMethodId,
      ],
      'authentication': [
        verificationMethodId,
      ]
    };
  }

  addProof(credentials: VCv1, proof: VerifiableCredentialProof) {
    return {
      ...credentials,
      proof
    }
  }

  proof(didUrl: string, jws: string) {
    return {
      type: "JsonWebSignature2020",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: didUrl + '#verification',
      jws
    }
  }
}
