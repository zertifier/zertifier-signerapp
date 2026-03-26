import {inject, Injectable} from '@angular/core';
import {SignerService} from '../services/SignerService';
import {CertificateProvider} from './CertificateProvider';
import {from} from 'rxjs';
import {CHApiService} from "../services/CHApiService";
import {LNRInput, LPInput, SOInput, TACInput, VCv1, VPInput} from './types/credential.types';
import {ApprovedCHs} from './types/clearingHouse.types';
import {CertFileInput, DecryptedCertificate} from './types/crypto.types';
import {PublishService} from '../services/publishers/PublishService';
import {PublishedFile, PublishInput} from './types/publisher.types';
import {DogshitConfig} from './data/dogshit.config';
import {joinPath} from '../util/strings.util';
import {HttpParams} from '@angular/common/http';
import {CredentialsBuilder_v2} from '../services/credentials-builder_v2.service';


@Injectable()
export class VcFlowV2Actions {
  #chApiService = inject(CHApiService);
  #certProvider = inject(CertificateProvider);
  #signerService = inject(SignerService);
  #publishService = inject(PublishService);
  #dsConfig = inject(DogshitConfig);
  #credBuilder = inject(CredentialsBuilder_v2);

  fetchCompliance(vp: object, input: VPInput, ch?: ApprovedCHs) {
    return this.#chApiService.fetch(
      vp,
      new HttpParams().set("vcid", input.url),
      'COMPLIANCE_V2_STANDARD', ch);
  }

  publishCompliance(compliance: string, baseUrl: string) {
    // TODO hardcoded domain
    return this.#publishService.publish(
      this.#dsConfig.publishDomains['Zertifier'],
      [{
        path: joinPath(baseUrl, this.#dsConfig.fileNames['compliance']),
        content: compliance
      }]);
  }

  // TODO extract this to the publish service when credentials will be dynamic
  publishPresentation(toPublish: PublishInput, baseUrl: string, didUrl: string) {
    // TODO hardcoded domain
    return this.#publishService.publish(
      this.#dsConfig.publishDomains['Zertifier'],
      this.#buildFilesToPublish(toPublish, baseUrl, didUrl)
    );
  }

  signSO(pKey: CryptoKey, didUrl: string, input: SOInput) {
    return this.#signVC(pKey, this.#credBuilder.so(didUrl, input), didUrl);
  }

  signTAC(pKey: CryptoKey, didUrl: string, input: TACInput) {
    return this.#signVC(pKey, this.#credBuilder.tac(didUrl, input), didUrl);
  }

  signLP(pkey: CryptoKey, didUrl: string, input: LPInput) {
    return this.#signVC(pkey, this.#credBuilder.lp(didUrl, input), didUrl);
  }

  buildVP(didUrl:string, vcArr: string[]) {
    return this.#credBuilder.vp(didUrl, vcArr);
  }

  fetchLrn_v2(input: LNRInput, ch?: ApprovedCHs) {
    return this.#chApiService
      .fetch_lnr_v2(
        input.vatId,
        new HttpParams()
          .set("vcId", input.url)
          .set("subjectId", `${input.url}#subject`)
        , ch);
  }

  decryptCert(input: CertFileInput) {
    return from(this.#certProvider.decrypt(input.file, input.pass));
  }

  #buildFilesToPublish(toPublish: PublishInput, baseUrl: string, didUrl: string) {
    const certUrl = joinPath(baseUrl, this.#dsConfig.fileNames['cert']);
    const files: PublishedFile[] = [
      {
        path: certUrl,
        content: toPublish.cert.pemCert
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['did']),
        content: JSON.stringify(this.#buildDidJson(toPublish.cert, didUrl, certUrl))
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['legalPerson']),
        content: toPublish.lp
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['tac']),
        content: toPublish.tac
      },
      {
        path: joinPath(baseUrl, this.#dsConfig.fileNames['lnr']),
        content: toPublish.lrn
      }
    ];
    if (toPublish.so) {
      files.push({
        path: joinPath(baseUrl, this.#dsConfig.fileNames['so']),
        content: toPublish.so
      })
    }
    return files;
  }

  #buildDidJson(cert: DecryptedCertificate, didUrl: string, certUrl: string) {
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

  #signVC(pKey: CryptoKey, offer: VCv1, didUrl: string) {
    return from(this.#signerService.signWithEnvelope_v2(offer, didUrl, pKey));
  }
}
