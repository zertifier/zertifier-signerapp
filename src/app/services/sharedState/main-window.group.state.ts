import {computed, inject, Injectable, signal} from '@angular/core';
import {CredentialsProvider} from '../../core/CredentialsProvider';
import {ToastService} from '../ToastService';
import {ApprovedCHs} from '../../core/types/clearingHouse.types';
import {DogshitConfig} from '../../core/data/dogshit.config';
import {SOInput} from '../../core/types/credential.types';
import {catchError, EMPTY, switchMap, tap} from 'rxjs';
import {requireValue, withLoading} from '../../util/util';
import {joinPath, urlToDid} from '../../util/strings.util';

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
  did = computed(() => {
    const url = this.baseUrl();
    if (url) {
      return urlToDid(url)
    }
    return undefined;
  });

  credentialProvider = inject(CredentialsProvider);
  #toast = inject(ToastService);
  #dsConfig = inject(DogshitConfig);

  constructor() {
    this.baseUrl.set("https://www.zertifier.com/docs/vc/zertifier/main");
    this.vatId.set("ESB05303755");
    this.legalName.set("ZERTIFIER SL");
    this.countryCode.set("ES-CT");
  }

  fetchLnr() {
    withLoading(
      this.credentialProvider
        .fetchLnr({
          url: this.buildFilePath('lnr'),
          vatId: requireValue(this.vatId(), "Vat ID")
        }, this.ch())
      , this.isLoading)
      .pipe(
        tap(()=> this.#toast.success('Legal registration number received'))
      )
      .subscribe();
  }

  buildSO(input: SOInput) {
    withLoading(
      this.credentialProvider.buildSO(
        requireValue(this.did(), "Did.json url"), input),
      this.isLoading)
      .pipe(
        tap(()=> this.#toast.success('Service offering built'))
      )
      .subscribe();
  }

  buildLP() {
    withLoading(
      this.credentialProvider.buildLP(
        requireValue(this.did(), "Did.json url"),
        {
          url: this.buildFilePath('lp'),
          lnrSubject: `${this.buildFilePath('lnr')}${this.#dsConfig.subjectPostfix}`,
          countryCode: requireValue(this.countryCode(), "Country Code"),
          legalName: requireValue(this.legalName(), "Legal name"),
        }),
      this.isLoading)
      .pipe(
        tap(()=> this.#toast.success('Legal participant built'))
      )
      .subscribe();
  }

  buildTac() {
    withLoading(
      this.credentialProvider.buildTAC(
        requireValue(this.did(), "Did.json url"),
        {url: this.buildFilePath('tac')}),
      this.isLoading)
      .pipe(
        tap(()=> this.#toast.success('Terms and conditions built'))
      )
      .subscribe();
  }

  decryptCert() {
    withLoading(
      this.credentialProvider.decryptCert({
        file: requireValue(this.file(), 'Certificate file'),
        pass: requireValue(this.pass(), "Certificate password")
      }), this.isLoading)
      .pipe(
        tap(()=> this.#toast.success('Certificate decrypted'))
      )
      .subscribe();
  }

  fetchCompliance() {
    withLoading(
      this.credentialProvider
        .fetchCompliance(
          {url: this.buildFilePath('compliance')},
          this.ch()
        )
        .pipe(
          switchMap(() =>
            this.credentialProvider.publishCompliance(requireValue(this.baseUrl(), "Publish url"))
          ),
          catchError((err: any) => {
            this.#toast.error('Publish or offer failed!');
            console.error("Publish or offer failed", {cause: err})
            return EMPTY;
          })
        ), this.isLoading)
      .pipe(
        tap(()=> this.#toast.success('Compliance received'))
      )
      .subscribe();
  }

  publishOffer() {
    withLoading(this.credentialProvider.publishPresentation(
        requireValue(this.baseUrl(), "Publish url"),
        requireValue(this.did(), "Did.json url"))
      , this.isLoading).subscribe({
      next: () => {
        this.#toast.info("Publishing offer was successful!")
      },
      error: err => {
        this.#toast.error("Publishing failed!")
        console.error('Publishing failed', {cause: err})
      }
    });
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

  buildFilePath(filename: string) {
    return joinPath(requireValue(this.baseUrl(), "Publish url"), this.#dsConfig.fileNames[filename])
  }

}
