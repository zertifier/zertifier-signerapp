import {computed, effect, inject, Injectable, OnDestroy, OnInit, signal} from '@angular/core';
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

@Injectable()
export class CredentialsProvider{
  #clearingHouseApiService = inject(ClearingHouseApiService);
  #signerService = inject(SignerService);
  #credentialsBuilder = inject(CredentialsBuilder);
  certificateProvider = inject(CertificateProvider);
  legalRegistrationNumber = signal<VerifiableCredentialV1 | null>(null);
  legalParticipant = signal<VerifiableCredentialV1 | null>(null);
  termsAndConditions = signal<VerifiableCredentialV1 | null>(null);
  isSignedTermsAndConditions = computed(()=> !!this.termsAndConditions()?.["proof"]);
  verifiablePresentation = signal<VerifiablePresentation | null>(null);
  isSignedLegalParticipant = computed(()=> !!this.legalParticipant()?.["proof"]);
  complianceVerifiableCredentials = signal<Object | null>(null);

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
    let vc = this.termsAndConditions();
    if(!vc) throw new Error("Credentials not ready!");
    let res = await this.signVerifiableCredential(vc, didUrl);
    this.termsAndConditions.set(res);
    return res;
  }

  async signLegalParticipant(didUrl: string){
    let vc = this.legalParticipant();
    if(!vc) throw new Error("Credentials not ready!");
    let res = await this.signVerifiableCredential(vc, didUrl);
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
    this.#clearingHouseApiService.getLegalRegistrationNumber(legalRegistrationNumberInputData, clearingHouse)
      .subscribe((value:Object) => {
        console.log("fired fetch lnr")
        this.legalRegistrationNumber.set(value as VerifiableCredentialV1)
      });
  }

  offerPresentation(verifiablePresentationUrl: string){
    const vp = this.verifiablePresentation();
    // if(!vp?.verifiableCredential?.length || vp?.verifiableCredential?.length < 3) throw new Error()
    if(!vp || !this.legalParticipant() || !this.termsAndConditions() || !this.legalRegistrationNumber()){
      // Missing credentials
      console.log("Missing credentials");
      console.log(this.legalRegistrationNumber());
      console.log(this.legalParticipant());
      console.log(this.termsAndConditions());

      throw new Error("Verifiable credentials not ready!")
    }
    const inputData: VerifiablePresentationInputData ={
      verifiablePresentation: vp,
      url: verifiablePresentationUrl
    }
    this.#clearingHouseApiService.offerVerifiablePresentation(inputData)
      .subscribe((res: Object)=> this.complianceVerifiableCredentials.set(res));
  }

}

