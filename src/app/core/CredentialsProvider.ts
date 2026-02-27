import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {SignerService} from '../services/SignerService';
import {CertificateProvider} from './CertificateProvider';
import {ToastService} from '../services/ToastService';
import {finalize} from 'rxjs';
import {CHApiService} from "../services/CHApiService";
import {CredentialsBuilder} from '../services/CredentialsBuilder';
import {LNRInput, LPInput, TACInput, VCv1, VPInput} from './types/credential.types';
import {ApprovedCHs} from './types/clearingHouse.types';

@Injectable()
export class CredentialsProvider {
  chApiService = inject(CHApiService);
  certProvider = inject(CertificateProvider);
  lnr = signal<VCv1 | null>(null);
  lp = signal<VCv1 | null>(null);
  tac = signal<VCv1 | null>(null);
  compliance = signal<object | null>(null);
  #signerService = inject(SignerService);
  #credBuilder = inject(CredentialsBuilder);
  vpOffer = computed(() => {
    const lnr_l = this.lnr();
    const lp_l = this.lp();
    const tac_l = this.tac();
    if (!(lnr_l && lp_l && tac_l)) return null;
    return this.#credBuilder.vp([lnr_l, lp_l, tac_l]);
  })
  #toast = inject(ToastService);

  offerPresentation(input: VPInput, isLoading: WritableSignal<boolean>, ch?: ApprovedCHs) {
    const vp_l = this.vpOffer();
    if (!vp_l) {
      throw new Error("Not all required VCs are found.")
    }
    isLoading.set(true);
    this.chApiService.offer(vp_l, input.url, 'COMPLIANCE', ch)
      .pipe(
        finalize(() => isLoading.set(false))
      )
      .subscribe((resp: any) =>
        this.compliance.set(resp)
      );
  }

  async buildTAC(didUrl: string, input: LPInput, isLoading?: WritableSignal<boolean>) {
    await this.#buildVC("TAC", didUrl, input, isLoading);
  }

  async buildLP(didUrl: string, input: LPInput, isLoading?: WritableSignal<boolean>) {
    await this.#buildVC("LP", didUrl, input, isLoading);
  }

  // TODO maybe some protection to what is received???
  fetchLnr(input: LNRInput, isLoading?: WritableSignal<boolean>, ch?: ApprovedCHs) {
    isLoading?.set(true);
    this.chApiService
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


  async #buildVC(type: "TAC" | "LP", didUrl: string, input: LPInput | TACInput, isLoading?: WritableSignal<boolean>) {
    isLoading?.set(true);
    try {
      const pKey = this.certProvider.decryptedCertificate()?.pKey;
      if (!pKey) {
        throw new Error("Private key not found. Decrypt a certificate first.")
      }
      if (type === 'TAC') {
        this.tac.set(await this.#signerService
          .signCredential(this.#credBuilder.tac(didUrl, input as TACInput),
            didUrl, pKey)
        );
      } else if (type === 'LP') {
        this.lp.set(await this.#signerService
          .signCredential(this.#credBuilder.lp(didUrl, input as LPInput),
            didUrl, pKey)
        );
      } else {
        throw new Error("Unknown VC type passed.")
      }
    } finally {
      isLoading?.set(false);
    }
  }
}
