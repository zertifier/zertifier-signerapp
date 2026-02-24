export interface VCv1 {
  "@context": string[] | string;
  "type"?: string[] | string;

  [key: string]: any;
}

export interface TermsAndConditionsInputData {
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


export type VP = VCv1 & { credential: VCv1[] }

export interface LegalParticipantInputData {
  url: string;
  legalRegistrationNumberSubjectUrl: string;
  countryCode: string;
  legalName: string;
}
