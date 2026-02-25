// Extend the DOM JsonWebKey to allow x5u (and future x5* fields) used in JOSE

export interface JoseJsonWebKey extends JsonWebKey {
  x5u?: string;
  x5c?: string[];
}

export type CertificateInfo = {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  serialNumberHex: string;
  validFrom: string; // ISO string
  validTo: string;   // ISO string
  sha256Fingerprint: string; // colon separated uppercase hex
  keyUsage?: string[];
  organizationIdentifier?: string; // e.g. VATES-B55272140
}

export type DecryptedCertificate = {
  pKey: CryptoKey;
  pubKey: DecryptedJWK;
  pemCert: string;
  certInfo: CertificateInfo;
}

export type DecryptedJWK = {
  kty: 'RSA';
  n: string;
  e: string;
  alg: 'RS256';
  x5c?: string[];
}
