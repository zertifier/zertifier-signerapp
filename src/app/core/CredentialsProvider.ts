import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {
  ClearingHouseApiService,
  ClearingHouses,
  LegalRegistrationNumberInputData,
  VerifiablePresentation, VerifiablePresentationInputData
} from './ClearingHouseApiService';
import {SignerService} from './SignerService';
import {CertificateProvider} from './CertificateProvider';
import {
  CredentialsBuilder,
  LegalParticipantInputData,
  TermsAndConditionsInputData,
  VerifiableCredentialV1
} from './CredentialsBuilder';
import { ToastService } from './ToastService';
import { finalize } from 'rxjs';

@Injectable()
export class CredentialsProvider{
  clearingHouseApiService = inject(ClearingHouseApiService);
  #signerService = inject(SignerService);
  #credentialsBuilder = inject(CredentialsBuilder);
  #toast = inject(ToastService);
  certificateProvider = inject(CertificateProvider);
  legalRegistrationNumber = signal<VerifiableCredentialV1 | null>(null);
  legalParticipant = signal<VerifiableCredentialV1 | null>(null);
  termsAndConditions = signal<VerifiableCredentialV1 | null>(null);
  isSignedTermsAndConditions = computed(()=> !!this.termsAndConditions()?.["proof"]);
  verifiablePresentation = signal<VerifiablePresentation | null>(null);
  isSignedLegalParticipant = computed(()=> !!this.legalParticipant()?.["proof"]);
  complianceVerifiableCredentials = signal<object | null>(null);
  isOffering = signal<boolean>(false);

  constructor() {
    console.log("New CredentialsProvider constructed")
    effect(() => {
      const vp: VerifiableCredentialV1[] = [];
      const lnr = this.legalRegistrationNumber();
      const lp = this.legalParticipant();
      const tac = this.termsAndConditions();
      lnr && vp.push(lnr);
      lp && vp.push(lp);
      tac && vp.push(tac);
      this.verifiablePresentation.set(this.#credentialsBuilder.buildVerifiablePresentation(vp));
    });
  }

  async signTermsAndConditions(didUrl: string){
    const vc = this.termsAndConditions();
    if(!vc) throw new Error("Credentials not ready!");
    const res = await this.signVerifiableCredential(vc, didUrl);
    this.termsAndConditions.set(res);
    return res;
  }

  async signLegalParticipant(didUrl: string){
    const vc = this.legalParticipant();
    if(!vc) throw new Error("Credentials not ready!");
    const res = await this.signVerifiableCredential(vc, didUrl);
    this.legalParticipant.set(res);
    return res;
  }

  async signVerifiableCredential(vc: VerifiableCredentialV1, didUrl: string){
    const pKey = this.certificateProvider.privateKey();
    if(!pKey) throw new Error("Private key not found!");
    return await this.#signerService.signCredential(vc, didUrl, pKey);
  }

  buildLegalParticipant(didUrl: string, legalParticipantInputData: LegalParticipantInputData) {
    this.legalParticipant.set(this.#credentialsBuilder.buildLegalParticipant(didUrl,legalParticipantInputData))
  }

  buildTermsAndConditions(didUrl: string, termsAndConditionInputData: TermsAndConditionsInputData) {
    this.termsAndConditions.set(this.#credentialsBuilder.buildTermsAndConditions(didUrl,termsAndConditionInputData))
  }

  getLegalRegistrationNumber(legalRegistrationNumberInputData: LegalRegistrationNumberInputData, clearingHouse?: ClearingHouses) {
    this.clearingHouseApiService.getLegalRegistrationNumber(legalRegistrationNumberInputData, clearingHouse)
      .subscribe((value: object) => {
        console.log("fired fetch lnr")
        this.legalRegistrationNumber.set(value as VerifiableCredentialV1)
      });
  }

  offerPresentation(verifiablePresentationUrl: string, ch: ClearingHouses= ClearingHouses.DELTA_DAO){
    if (this.isOffering()) return;
    const vp = this.verifiablePresentation();
    if(!vp || !this.legalParticipant() || !this.termsAndConditions() || !this.legalRegistrationNumber()){
      // Missing credentials
      console.log("Missing credentials");
      console.log(this.legalRegistrationNumber());
      console.log(this.legalParticipant());
      console.log(this.termsAndConditions());
      this.#toast.error('Verifiable credentials not ready!');
      throw new Error("Verifiable credentials not ready!")
    }
    const inputData: VerifiablePresentationInputData ={
      verifiablePresentation: vp,
      url: verifiablePresentationUrl
    }
    this.isOffering.set(true);
    this.clearingHouseApiService.offerVerifiablePresentation(inputData, ch)
      .pipe(finalize(() => this.isOffering.set(false)))
      .subscribe({
        next: (res: object) => {
          this.complianceVerifiableCredentials.set(res);
          this.#toast.success('Offer VP processed successfully.');
        },
        error: (err: unknown) => {
          console.error('Offer VP failed', err);
          this.#toast.error('Offer VP failed. Please try again.');
        }
      });
  }

}

