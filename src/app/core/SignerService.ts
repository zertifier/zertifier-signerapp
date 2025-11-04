import {Injectable} from '@angular/core';
import * as jsonld from 'jsonld';
import {Options} from 'jsonld';
import {CompactSign, CryptoKey} from 'jose';
import {VerifiableCredentialV1} from './CredentialsBuilder';
import Normalize = Options.Normalize;

export interface VerifiableCredentialProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws: string;
}

@Injectable({
  providedIn: "root"
})
export class SignerService {
  async signCredential(vc: VerifiableCredentialV1, didUrl: string, pKey: CryptoKey) {
    return this.#addProof(vc,
      this.#buildProof(didUrl,
        await this.#sign(
          await this.#hash(vc), pKey)));
  }

  async #hash(doc: jsonld.JsonLdDocument) {
    console.log(" > Hashing: start...");
    const canonized = await jsonld.canonize(doc, {
        algorithm: 'URDNA2015',
        format: 'application/n-quads',
        safe: true
      } as Normalize
    )
    console.log(" > Hashing: document canonized");
    // Usar Web Crypto API nativa
    const msgBuffer = new TextEncoder().encode(canonized);
    const shaHash = await crypto.subtle.digest('SHA-256', msgBuffer);
    const shaHashArray = Array.from(new Uint8Array(shaHash));
    const shaHashHex = shaHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const hash = new TextEncoder().encode(shaHashHex);

    console.log(" > Hashing: finish with uint8Array:", hash);

    return hash;
  }

  async #sign(hash: Uint8Array, pKey: CryptoKey) {
    console.log(" > Signing: start...");
    let sign = await new CompactSign(hash)
      .setProtectedHeader({
        alg: 'RS256',
        b64: false,
        crit: ['b64']
      })
      .sign(pKey);
    console.log(" > Signing: finish with jws:", sign);
    return sign;
  }

  #buildProof(didUrl: string, jws: string) {
    let proof = {
      type: "JsonWebSignature2020",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: didUrl + '#verification',
      jws
    };
    console.log(" > Built proof:",proof);
    return proof
  }

  #addProof(credentials: VerifiableCredentialV1, proof: VerifiableCredentialProof) {
    let credWithProof = {
      ...credentials,
      proof
    };
    console.log(" > Proof added to credential:",credWithProof);
    return credWithProof
  }
}
