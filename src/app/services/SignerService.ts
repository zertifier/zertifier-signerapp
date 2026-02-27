import {inject, Injectable} from '@angular/core';
import * as jsonld from 'jsonld';
import {Options} from 'jsonld';
import {CompactSign, CryptoKey} from 'jose';
import {CredentialsBuilder} from './CredentialsBuilder';
import {VCv1} from '../core/types/credential.types';
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
  credentialsBuilder = inject(CredentialsBuilder);

  async signCredential(vc: VCv1, didUrl: string, pKey: CryptoKey) {
    const hash = await this.#hash(vc);
    const signature = await this.#sign(hash, pKey);
    const proof = this.credentialsBuilder.proof(didUrl, signature);
    return this.credentialsBuilder.addProof(vc, proof);
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
}
