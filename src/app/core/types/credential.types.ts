export interface VCv1 {
  "@context": string[] | string;
  "type"?: string[] | string;

  [key: string]: any;
}

export interface TACInput {
  url: string;
}

export type SOInput = {
  url: string;
  subject: string;
  name?: string,
  description?: string,
  // Legal Participant URL
  providedByUrl: string,
  tac: SO_TAC,
  dataAccountExport: DataAccountExport,
}

export type SO_TAC = {
  "gx:URL": string,
  "gx:hash": string
}

export type DataAccountExport = {
  "gx:requestType": RequestTypes,
  "gx:accessType": 'digital' | 'physical',
  // MIME types https://gaia-x.gitlab.io/technical-committee/service-characteristics-working-group/service-characteristics/enums/MIMETypes/
  "gx:formatType": string,
}

export const REQUEST_TYPES = [
  'API', 'email', 'webform', 'unregisteredLetter', 'registeredLetter', 'supportCenter'
] as const;

export type RequestTypes = typeof REQUEST_TYPES[number];

export interface DIDInput {
  id: string;
  cert_x5u_url: string;
  /** X.509 certificate chain (JWK `x5c`) */
  cert_x5c_chain?: string[];
  pub_n: string;
  pub_e?: string;
  alg?: string;
  kty?: string;
  verificationMethodId?: string;
}

export type VPInput = {
  url: string;
}

export type VP = VCv1 & { verifiableCredential: VCv1[] }

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
