import * as forge from 'node-forge';
import {CertificateInfo} from '../types/crypto.types';
import {fixMojibake} from './strings.util';


export function buildCertificateInfo(cert: forge.pki.Certificate): CertificateInfo {
  const subject: Record<string, string> = getAttributes(cert.subject.attributes || []);
  const issuer: Record<string, string> = getAttributes(cert.issuer.attributes || []);
  let organizationIdentifier: string | undefined = getOrgId(subject);

  return {
    subject,
    issuer,
    serialNumberHex: cert.serialNumber?.toUpperCase?.() ?? String(cert.serialNumber ?? ''),
    validFrom: cert.validity.notBefore?.toISOString?.() ?? '',
    validTo: cert.validity.notAfter?.toISOString?.() ?? '',
    sha256Fingerprint: shaFingerprint(cert),
    keyUsage: getKeyUsage(cert.extensions || []),
    organizationIdentifier
  };
}

export function getKeyUsage(extensions: any[]) {
  const keyUsageExt = extensions.find(e => e["name"] === 'keyUsage') || {};
  const keyUsage: string[] = [];
  for (const k of keyUsageExt) {
    const v = keyUsageExt[k];
    if (typeof v === 'boolean' && v && k !== 'critical' && k !== 'name') {
      keyUsage.push(k);
    }
  }
  return keyUsage;
}

export function shaFingerprint(cert: forge.pki.Certificate) {
  const derBytes = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const md = forge.md.sha256.create();
  md.update(derBytes);
  const hex = md.digest().toHex().toUpperCase();
  return hex.match(/.{1,2}/g)?.join(':') ?? hex;
}

export function getAttributes(fields: forge.pki.CertificateField[]) {
  const attributes: Record<string, string> = {};
  for (const f of fields) {
    const key = f["name"] ?? f["type"] ?? f["shortName"];
    if (key) {
      attributes[key] = fixMojibake(String(f["value"] ?? ''));
    }
  }
  return attributes;
}

export function getOrgId(attributes: Record<string, string>) {
  for (const k in attributes) {
    if (k === '2.5.4.97' || k === 'organizationIdentifier') {
      return attributes[k];
    }
  }
  return undefined;
}
