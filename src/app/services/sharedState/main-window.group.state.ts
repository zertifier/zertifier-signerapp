import {inject, Injectable, signal} from '@angular/core';
import {CredentialsProvider} from '../../core/CredentialsProvider';
import {ToastService} from '../ToastService';
import {ApprovedCHs} from '../../core/types/clearingHouse.types';
import {DogshitConfig} from '../../core/data/dogshit.config';
import {LPInput, SOInput} from '../../core/types/credential.types';
import {catchError, EMPTY, switchMap} from 'rxjs';

@Injectable()
export class MainWindowGroupState {
  baseUrl = signal<string | null>(null);
  vatId = signal<string | null>(null);
  countryCode = signal<string | null>(null);
  legalName = signal<string | null>(null);
  file = signal<File | null>(null);
  pass = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  ch = signal<ApprovedCHs | undefined>("ARUBA");
  did = signal<string | null>(null);

  credentialProvider = inject(CredentialsProvider);
  #toast = inject(ToastService);
  #dsConfig = inject(DogshitConfig);

  constructor() {
    this.baseUrl.set("https://www.zertifier.com/docs/vc/megatro/main");
    this.vatId.set("ESB55272140");
    this.pass.set("");
    this.countryCode.set("ES-es");
  }

  fetchLnr() {
    const baseUrl = this.baseUrl();
    const vatId = this.vatId();
    if (!baseUrl || !vatId) {
      this.#toast.error("Legal registration number inputs are not filled");
      return;
    }
    this.credentialProvider.fetchLnr({url: this.buildFileUrl("lnr"), vatId}, this.isLoading, this.ch());
  }

  buildSO(input: SOInput) {
    if (this.isLoading()) {
      this.#toast.info("Already have started!");
      return;
    }
    const did = this.did();
    if (!did) {
      this.#toast.error("Did url is not set!");
      return;
    }
    const baseUrl = this.baseUrl();
    if (!baseUrl) {
      this.#toast.error("Base url is not set!");
      return;
    }
    this.credentialProvider.buildSO(did, input, this.isLoading);
  }

  buildLP() {
    if (this.isLoading()) {
      this.#toast.info("Already have started!");
      return;
    }
    const baseUrl = this.baseUrl();
    if (!baseUrl) {
      this.#toast.error("Base url is not set!");
      return;
    }
    const did = this.did();
    if (!did) {
      this.#toast.error("Did url is not set!");
      return;
    }
    const code = this.countryCode();
    const legalName = this.legalName();
    if (!code || !legalName) {
      this.#toast.error("Inputs are not filled");
      return;
    }
    const inputs: LPInput = {
      url: this.buildFileUrl("lp"),
      lnrSubject: `${this.buildFileUrl('lnr')}${this.#dsConfig.subjectPostfix}`,
      countryCode: code,
      legalName
    }
    this.credentialProvider.buildLP(did, inputs, this.isLoading);
  }

  buildTac() {
    if (this.isLoading()) {
      this.#toast.info("Already have started!");
      return;
    }
    const baseUrl = this.baseUrl();
    if (!baseUrl) {
      this.#toast.error("Base url is not set!");
      return;
    }
    const did = this.did();
    if (!did) {
      this.#toast.error("Did url is not set!");
      return;
    }
    this.credentialProvider.buildTAC(did, {url: this.buildFileUrl("tac")}, this.isLoading);
  }

  decryptCert() {
    const file = this.file();
    const pass = this.pass();
    if (!file || !pass) {
      this.#toast.error('Certificate file or password not found');
      return;
    }
    this.credentialProvider.decryptCert({file, pass}, this.isLoading);
  }

  getCompliance(path: string) {
    this.credentialProvider
      .offerPresentation(
        {url: this.buildFileUrl('compliance')},
        this.isLoading, this.ch()
      )
      .pipe(
        switchMap(() =>
          this.credentialProvider.publishCompliance(path, this.isLoading)
        ),
        catchError((err: any) => {
          this.#toast.error('Publish or offer failed!');
          return EMPTY;
        })
      )
      .subscribe();
  }

  publishOffer(path: string) {
    const did = this.did();
    if (!did) {
      this.#toast.error("Did url is not set!");
      return;
    }

    this.credentialProvider.publishOffer(path, did, this.isLoading).subscribe({
      next: () => {
        this.#toast.info("Publishing offer was successful!")
      },
      error: err => {
        this.#toast.error("Publishing failed!")
        console.error(`Publishing failed`, {cause: err})
      },
    });
  }

  buildFileUrl(fileName: string) {
    const base = this.baseUrl();
    // this shouldn't be thrown ever if you are not stupid
    if (!base) {
      this.#toast.error("Base url is not set!");
      return "you are stupid";
    }
    return `${base}/${this.#dsConfig.fileNames[fileName]}`;
  }

  copyToClipboard(content: Object | null | undefined) {
    if (!content) {
      this.#toast.error("Content to copy not found.", {duration: 2000});
      return;
    }
    navigator.clipboard
      .writeText(JSON.stringify(content, null, 2))
      .then(() => {
        this.#toast.info('Copied!', {duration: 2000});
      });
  }

}
