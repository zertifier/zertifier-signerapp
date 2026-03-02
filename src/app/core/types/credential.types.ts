export interface VCv1 {
  "@context": string[] | string;
  "type"?: string[] | string;

  [key: string]: any;
}

export interface TACInput {
  url: string;
}

export interface DIDInput {
  id: string;
  certificateUrl_x5u: string;
  /** X.509 certificate chain (JWK `x5c`) */
  certificateChain_x5c?: string[];
  publicKey_n: string;
  publicKey_e?: string;
  alg?: string;
  kty?: string;
  verificationMethodId?: string;
}

export type VPInput = {
  url: string;
}

export type VP = VCv1 & { credential: VCv1[] }

export interface LPInput {
  url: string;
  lnrSubject: string;
  countryCode: string;
  legalName: string;
}

export type LNRInput = {
  url: string;
  vatId: string;
}
