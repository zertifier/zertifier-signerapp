import {computed, inject, Injectable, signal} from '@angular/core';
import {SignerService} from '../services/SignerService';
import {CertificateProvider} from './CertificateProvider';
import {from, tap} from 'rxjs';
import {CHApiService} from "../services/CHApiService";
import {CredentialsBuilder} from '../services/CredentialsBuilder';
import {LNRInput, LPInput, SOInput, TACInput, VCv1, VPInput} from './types/credential.types';
import {ApprovedCHs} from './types/clearingHouse.types';
import {CertFileInput, DecryptedCertificate} from './types/crypto.types';
import {PublishService} from '../services/publishers/PublishService';
import {PublishedFile} from './types/publisher.types';
import {DogshitConfig} from './data/dogshit.config';
import {joinPath} from '../util/strings.util';
import {requireValue} from '../util/util';

@Injectable()
export class CredentialsProvider {
  lnr = signal<VCv1 | null>(null);
  lp = signal<VCv1 | null>(null);
  tac = signal<VCv1 | null>(null);
  so = signal<VCv1 | null>(null);
  compliance = signal<object | null>(null);
  cert = signal<DecryptedCertificate | null>(null);
  #chApiService = inject(CHApiService);
  #certProvider = inject(CertificateProvider);
  #signerService = inject(SignerService);
  #credBuilder = inject(CredentialsBuilder);
  presentation = computed(() => {
    const lnr_l = this.lnr();
    const lp_l = this.lp();
    const tac_l = this.tac();
    if (!(lnr_l && lp_l && tac_l)) return null;
    // TODO somehow streamline gathering process
    const vps = [lnr_l, lp_l, tac_l, this.so()]
      .filter((a: any): a is NonNullable<VCv1> => !!a);
    return this.#credBuilder.vp(vps);
  })
  #publishService = inject(PublishService);
  #dsConfig = inject(DogshitConfig);

  fetchCompliance(input: VPInput, ch?: ApprovedCHs) {
    return this.#chApiService
      .fetch(requireValue(this.presentation(), "Verifiable presentation"), input.url, 'COMPLIANCE', ch)
      .pipe(
        tap(resp => this.compliance.set(resp)),
      );
  }

  publishCompliance(baseUrl: string) {
    // TODO hardcoded domain
    return this.#publishService
      .publish(this.#dsConfig.publishDomains['Zertifier'], [{
        path: joinPath(baseUrl, this.#dsConfig.fileNames['compliance']),
        content: JSON.stringify(requireValue(this.presentation(), "Verifiable presentation"))
      }]);
  }

  // TODO extract this to the publish service when credentials will be dynamic
  publishPresentation(baseUrl: string, didUrl: string) {
    // TODO hardcoded domain
    return this.#publishService
      .publish(this.#dsConfig.publishDomains['Zertifier'], this.#buildFilesToPublish(baseUrl, didUrl));
  }

  buildSO(didUrl: string, input: SOInput) {
    return this.#signVC(this.#credBuilder.so(didUrl, input), didUrl)
      .pipe(
        tap((r: any) => this.so.set(r))
      );
  }

  buildTAC(didUrl: string, input: TACInput) {
    return this.#signVC(this.#credBuilder.tac(didUrl, input), didUrl)
      .pipe(
        tap((r: any) => this.tac.set(r))
      );
  }

  buildLP(didUrl: string, input: LPInput) {
    return this.#signVC(this.#credBuilder.lp(didUrl, input), didUrl)
      .pipe(
        tap((r: any) => this.lp.set(r))
      );
  }

  // TODO maybe some protection to what is received???
  fetchLnr(input: LNRInput, ch?: ApprovedCHs) {
    return this.#chApiService
      .fetch(
        this.#credBuilder.lnrOffer(input.url, input.vatId),
        input.url, "LNR", ch)
      .pipe(
        tap((v: Object) => this.lnr.set(v as VCv1))
      );
  }

  decryptCert(input: CertFileInput) {
    return from(this.#certProvider.decrypt(input.file, input.pass))
      .pipe(
        tap((r: DecryptedCertificate) => this.cert.set(r))
      )
  }

  #buildFilesToPublish(baseUrl: string, didUrl: string) {
    const certPem = requireValue(this.cert()?.pemCert, "Certificate");
    const lnr = requireValue(this.lnr(), "Legal Registration Number");
    const tac = requireValue(this.lp(), "Legal participant");
    const lp = requireValue(this.tac(), "Terms and conditions");
    const certUrl = joinPath(baseUrl, this.#dsConfig.fileNames['cert']);
    const files: PublishedFile[] = [
      {
        path: certUrl,
        content: certPem
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['did']),
        content: JSON.stringify(this.#buildDidJson(didUrl, certUrl))
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['lp']),
        content: JSON.stringify(lp)
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['tac']),
        content: JSON.stringify(tac)
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['lnr']),
        content: JSON.stringify(lnr)
      }
    ];
    const so = this.so();
    if (so) {
      files.push({
        path: joinPath(baseUrl, this.#dsConfig.fileNames['so']),
        content: JSON.stringify(so)
      })
    }
    return files;
  }

  #buildDidJson(didUrl: string, certUrl: string) {
    const cert = requireValue(this.cert(), "Certificate");
    return this.#credBuilder.did({
      id: didUrl,
      kty: cert.pubKey.kty,
      pub_n: cert.pubKey.n,
      pub_e: cert.pubKey.e,
      alg: cert.pubKey.alg,
      cert_x5u_url: certUrl,
      cert_x5c_chain: cert.pubKey.x5c
    });
  }

  #signVC(offer: VCv1, didUrl: string) {
    return from(this.#signerService
      .signCredential(offer,
        didUrl, requireValue(this.cert()?.pKey, "Private key")));
  }
}
