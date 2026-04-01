import {inject, Injectable} from '@angular/core';
import {DIDInput, LPInput, SOInput, TACInput, VP} from '../core/types/credential.types';
import {SO_TEMPLATE} from '../core/data/CredentialTemplates';
import {DogshitConfig} from '../core/data/dogshit.config';

@Injectable({providedIn: "root"})
export class CredentialsBuilder_v2 {
  dsConfig = inject(DogshitConfig);

  vp(did: string, vcid: string, jwsArr: string[]): VP {
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2"
      ],
      "id": vcid,
      "type": "EnvelopedVerifiablePresentation",
      "issuer": did,
      "validFrom": new Date().toISOString(),
      "verifiableCredential": jwsArr.map(jws => ({
        "@context": "https://www.w3.org/ns/credentials/v2",
        "type": "EnvelopedVerifiableCredential",
        // Changed id -> @id
        "id": `data:${this.dsConfig.jwtConstants['VC_MIMO']},${jws}`
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
        "gx:GaiaXTermsAndConditions"
      ],
      "id": input.url,
      "issuer": didUrl,
      "validFrom": new Date().toISOString(),
      "credentialSubject": {
        "id": `${input.url}#${this.dsConfig.subjectPostfix}`,
        "gx:termsAndConditions": "The PARTICIPANT signing the Self-Description agrees as follows:\n- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n\nThe keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD)."
      }
    }
  }

  issuer(didUrl: string, input: TACInput) {
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/gaia-x/development#",
      ],
      "type": [
        "VerifiableCredential",
        "gx:Issuer"
      ],
      "id": input.url,
      "issuer": didUrl,
      "validFrom": new Date().toISOString(),
      "credentialSubject": {
        "id": `${input.url}#${this.dsConfig.subjectPostfix}`,
        "gx:gaiaxTermsAndConditions": "067dcac5efd18c1927deb1ffed3feab6d0ad044c0a9a263e6d5d8bdc43224515"
      }
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
        "id": `${input.url}#${this.dsConfig.subjectPostfix}`,
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
        }
      },
    }
  }

  did(input: DIDInput) {
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
      ],
      'id': input.id,
      'verificationMethod': [
        {
          'id': `${input.id}#${this.dsConfig.didVerificationMethod}`,
          'type': 'JsonWebKey',
          'controller': input.id,
          'publicKeyJwk': {
            'kid': this.dsConfig.didVerificationMethod,
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
        `${input.id}#${this.dsConfig.didVerificationMethod}`,
      ]
    };
  }
}
