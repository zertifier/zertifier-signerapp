import {Injectable} from '@angular/core';
import {VerifiableCredentialProof} from './SignerService';
import {DIDInput, LPInput, SOInput, TACInput, VCv1, VP} from '../core/types/credential.types';
import {LP_TEMPLATE, SO_TEMPLATE, TAC_TEMPLATE, VP_TEMPLATE} from '../core/data/CredentialTemplates';

@Injectable({providedIn: "root"})
export class CredentialsBuilder {

  vp(vcArr: VCv1[]): VP {
    return {
      ...VP_TEMPLATE,
      "verifiableCredential": vcArr
    }
  }

  so(didUrl: string, input: SOInput) {
    if (!didUrl || !input) throw new Error("Cant build credentials, received empty data!!!")
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
    if (!didUrl || !input) throw new Error("Cant build credentials, received empty data!!!")
    return {
      ...TAC_TEMPLATE,
      "id": input.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...TAC_TEMPLATE.credentialSubject,
        "id": `${input.url}#subject`
      },
    }
  }

  lp(didUrl: string, input: LPInput) {
    if (!didUrl || !input) throw new Error("Cant build credentials, received empty data!!!")
    if (!input.lnrSubject) throw new Error("Legal Registration Number Subject URL is required")
    return {
      ...LP_TEMPLATE,
      "id": input.url,
      "issuer": didUrl,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...LP_TEMPLATE.credentialSubject,
        "gx:legalName": input.legalName,
        "gx:headquarterAddress": {
          "gx:countrySubdivisionCode": input.countryCode
        },
        "gx:legalAddress": {
          "gx:countrySubdivisionCode": input.countryCode
        },
        "gx:legalRegistrationNumber": {
          "id": `${input.lnrSubject}`
        },
        "id": `${input.url}#subject`
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
