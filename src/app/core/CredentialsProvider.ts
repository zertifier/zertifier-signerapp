import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {SignerService} from '../services/SignerService';
import {CertificateProvider} from './CertificateProvider';
import {finalize, from, tap, throwError} from 'rxjs';
import {CHApiService} from "../services/CHApiService";
import {CredentialsBuilder} from '../services/CredentialsBuilder';
import {DIDInput, LNRInput, LPInput, SOInput, TACInput, VCv1, VPInput} from './types/credential.types';
import {ApprovedCHs} from './types/clearingHouse.types';
import {CertFileInput, DecryptedCertificate} from './types/crypto.types';
import {PublishService} from '../services/publishers/PublishService';
import {PublishedFile} from './types/publisher.types';
import * as path from 'node:path';
import {DogshitConfig} from './data/dogshit.config';

@Injectable()
export class CredentialsProvider {
  lnr = signal<VCv1 | null>(null);
  lp = signal<VCv1 | null>(null);
  tac = signal<VCv1 | null>(null);
  so = signal<VCv1 | null>(null);
  compliance = signal<object | null>(null);
  decryptedCertificate = signal<DecryptedCertificate | null>(null);
  #chApiService = inject(CHApiService);
  #certProvider = inject(CertificateProvider);
  #signerService = inject(SignerService);
  #credBuilder = inject(CredentialsBuilder);
  vpOffer = computed(() => {
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

  offerPresentation(input: VPInput, isLoading: WritableSignal<boolean>, ch?: ApprovedCHs) {
    const vp = this.vpOffer();
    if (!vp) {
      throw new Error("Not all required VCs are found.")
    }
    isLoading.set(true);
    return this.#chApiService.offer(vp, input.url, 'COMPLIANCE', ch)
      .pipe(
        tap(resp => this.compliance.set(resp)),
        finalize(() => isLoading.set(false))
      );
  }

  buildSO(didUrl: string, input: SOInput, isLoading?: WritableSignal<boolean>) {
    isLoading?.set(true);
    this.#signVC(this.#credBuilder.so(didUrl, input), didUrl).pipe(
      finalize(() => isLoading?.set(false))
    ).subscribe((resp: any) => this.so.set(resp));
  }

  buildTAC(didUrl: string, input: TACInput, isLoading?: WritableSignal<boolean>) {
    isLoading?.set(true);
    this.#signVC(this.#credBuilder.tac(didUrl, input), didUrl).pipe(
      finalize(() => isLoading?.set(false))
    ).subscribe((resp: any) => this.tac.set(resp));
  }

  buildLP(didUrl: string, input: LPInput, isLoading?: WritableSignal<boolean>) {
    isLoading?.set(true);
    this.#signVC(this.#credBuilder.lp(didUrl, input), didUrl).pipe(
      finalize(() => isLoading?.set(false))
    ).subscribe((resp: any) => this.lp.set(resp));
  }

  // TODO maybe some protection to what is received???
  fetchLnr(input: LNRInput, isLoading?: WritableSignal<boolean>, ch?: ApprovedCHs) {
    isLoading?.set(true);
    this.#chApiService
      .offer(
        this.#credBuilder.lnrOffer(input.url, input.vatId),
        input.url, "LNR", ch)
      .pipe(
        finalize(() => isLoading?.set(false))
      )
      .subscribe((value: object) => {
          this.lnr.set(value as VCv1)
        }
      );
  }

  decryptCert(input: CertFileInput, isLoading?: WritableSignal<boolean>) {
    if (!input.file || !input.pass) {
      throw new Error("Certificate file or password are not found!");
    }
    isLoading?.set(true);
    from(this.#certProvider.decrypt(input.file, input.pass))
      .pipe(
        finalize(() => isLoading?.set(false))
      ).subscribe((cert: DecryptedCertificate) => this.decryptedCertificate.set(cert))
  }

  #signVC(offer: VCv1, didUrl: string) {
    const pKey = this.decryptedCertificate()?.pKey;
    if (!pKey) {
      return throwError(() => new Error("Private key not found."));
    }
    return from(this.#signerService
      .signCredential(offer,
        didUrl, pKey));
  }
}
