import {Injectable} from '@angular/core';
import {DIDInput, LPInput, SOInput, TACInput, VP} from '../core/types/credential.types';
import {SO_TEMPLATE} from '../core/data/CredentialTemplates';

@Injectable({providedIn: "root"})
export class CredentialsBuilder_v2 {

  vp(did: string, vcid:string, jwsArr: string[]): VP {
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2"
      ],
      "id": vcid,
      "type": "VerifiablePresentation",
      "issuer": did,
      "validFrom": new Date().toISOString(),
      "verifiableCredential": jwsArr.map(jws => ({
        "@context": "https://www.w3.org/ns/credentials/v2",
        "type": "EnvelopedVerifiableCredential",
        // Changed id -> @id
        "id": `data:application/vc+jwt,${jws}`
      }))
    }
  }

  so(didUrl: string, input: SOInput) {
    return {
      ...SO_TEMPLATE,
      "id": input.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...SO_TEMPLATE.credentialSubject,
        ...(input.name ? {"gx:name": input.name} : {}),
        ...(input.description ? {"gx:description": input.description} : {}),
        "gx:providedBy": {
          "id": input.providedByUrl
        },
        "gx:termsAndConditions": input.tac,
        "gx:dataAccountExport": input.dataAccountExport,
        "id": input.subject
      },
    }
  }

  tac(didUrl: string, input: TACInput) {
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/gaia-x/development#",
      ],
      "type": [
        "VerifiableCredential",
        "gx:Issuer"
      ],
      "validFrom": new Date().toISOString(),
      "credentialSubject": {
        "gaiaxTermsAndConditions": "4bd7554097444c960292b4726c2efa1373485e8a5565d94d41195214c5e0ceb3",
        "id": `${input.url}#subject`
      },
      "issuer": didUrl,
      "id": input.url,
    }
  }

  lp(didUrl: string, input: LPInput) {
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/gaia-x/development#",
      ],
      "type": [
        "VerifiableCredential",
        "gx:LegalPerson"
      ],
      "id": input.url,
      "issuer": didUrl,
      "validFrom": new Date().toISOString(),
      "credentialSubject": {
        "gx:legalName": input.legalName,
        "gx:headquartersAddress": {
          "type": "gx:Address",
          "gx:countryCode": input.countryCode
        },
        "gx:legalAddress": {
          "type": "gx:Address",
          "gx:countryCode": input.countryCode
        },
        "gx:registrationNumber": {
          "id": `${input.lrnSubject}`
        },
        "id": `${input.url}#subject`
      },
    }
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
          'type': 'JsonWebKey',
          'controller': input.id,
          'publicKeyJwk': {
            'kid': 'verification',
            'kty': input.kty || 'RSA',
            'n': input.pub_n,
            'e': input.pub_e || 'AQAB',
            'alg': input.alg || 'RS256',
            'x5u': input.cert_x5u_url,
            'x5c': input.cert_x5c_chain,
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
}
