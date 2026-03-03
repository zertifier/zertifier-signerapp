import {Injectable} from '@angular/core';
import forge from 'node-forge';
import {fixMojibake} from '../../util/strings.util';
import {CertificateInfo} from '../../core/types/crypto.types';

@Injectable({providedIn: "root"})
export class CertificateBuilder {
  build(cert: forge.pki.Certificate): CertificateInfo {
    const subject: Record<string, string> = this.#getAttributes(cert.subject.attributes || []);
    const issuer: Record<string, string> = this.#getAttributes(cert.issuer.attributes || []);
    let organizationIdentifier: string | undefined = this.#getOrgId(subject);

    return {
      subject,
      issuer,
      serialNumberHex: cert.serialNumber?.toUpperCase?.() ?? String(cert.serialNumber ?? ''),
      validFrom: cert.validity.notBefore?.toISOString?.() ?? '',
      validTo: cert.validity.notAfter?.toISOString?.() ?? '',
      sha256Fingerprint: this.#shaFingerprint(cert),
      keyUsage: this.#getKeyUsage(cert.extensions || []),
      organizationIdentifier
    };
  }

  #getKeyUsage(extensions: any[]) {
    const keyUsageExt = extensions.find(e => e["name"] === 'keyUsage') || {};
    const keyUsage: string[] = [];
    for (const k in keyUsageExt) {
      const v = keyUsageExt[k];
      if (typeof v === 'boolean' && v && k !== 'critical' && k !== 'name') {
        keyUsage.push(k);
      }
    }
    return keyUsage;
  }

  #shaFingerprint(cert: forge.pki.Certificate) {
    const derBytes = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const md = forge.md.sha256.create();
    md.update(derBytes);
    const hex = md.digest().toHex().toUpperCase();
    return hex.match(/.{1,2}/g)?.join(':') ?? hex;
  }

  #getAttributes(fields: forge.pki.CertificateField[]) {
    const attributes: Record<string, string> = {};
    for (const f of fields) {
      const key = f["name"] ?? f["type"] ?? f["shortName"];
      if (key) {
        attributes[key] = fixMojibake(String(f["value"] ?? ''));
      }
    }
    return attributes;
  }

  #getOrgId(attributes: Record<string, string>) {
    for (const k in attributes) {
      if (k === '2.5.4.97' || k === 'organizationIdentifier') {
        return attributes[k];
      }
    }
    return undefined;
  }
}
