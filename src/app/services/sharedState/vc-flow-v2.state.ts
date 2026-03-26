import {computed, inject, Injectable, signal} from '@angular/core';
import {ToastService} from '../ToastService';
import {ApprovedCHs} from '../../core/types/clearingHouse.types';
import {DogshitConfig} from '../../core/data/dogshit.config';
import {RequestTypes, SOInput} from '../../core/types/credential.types';
import {EMPTY, switchMap, tap} from 'rxjs';
import {requireValue, withLoading} from '../../util/util';
import {joinPath, urlToDid} from '../../util/strings.util';
import {VcFlowV2Actions} from '../../core/VcFlowV2.actions';
import {DecryptedCertificate} from '../../core/types/crypto.types';

@Injectable()
export class VcFlowV2State {
  baseUrl = signal<string | undefined>(undefined);
  vatId = signal<string | undefined>(undefined);
  countryCode = signal<string | undefined>(undefined);
  legalName = signal<string | undefined>(undefined);
  file = signal<File | undefined>(undefined);
  pass = signal<string | undefined>(undefined);
  isLoading = signal<boolean>(false);
  ch = signal<ApprovedCHs | undefined>("ARUBA");
  lrn = signal<string | undefined>(undefined);
  lp = signal<string | undefined>(undefined);
  tac = signal<string | undefined>(undefined);
  so = signal<string | undefined>(undefined);
  compliance = signal<string | undefined>(undefined);
  cert = signal<DecryptedCertificate | undefined>(undefined);
  isIncludeSO = signal<boolean>(true);
  soName = signal<string | undefined>(undefined);
  soDescription = signal<string | undefined>(undefined);
  soTacUrl = signal<string | undefined>(undefined);
  soTacHash = signal<string | undefined>(undefined);
  soFormatType = signal<string>('application/json');
  soRequestType = signal<RequestTypes>('API');
  soSubject = signal<string | undefined>(undefined)

  did = computed(() => {
    const url = this.baseUrl();
    if (url) {
      return urlToDid(url)
    }
    return undefined;
  });
  #vcFlowV2Actions = inject(VcFlowV2Actions);
  presentation = signal<string | undefined>(undefined);
  #toast = inject(ToastService);
  #dsConfig = inject(DogshitConfig);

  constructor() {
    this.baseUrl.set("https://www.zertifier.com/docs/vc2/zertifier/main");
    this.vatId.set("ESB05303755");
    this.legalName.set("ZERTIFIER SL");
    this.countryCode.set("ES-CT");
    this.soTacUrl.set("https://zertifier.com/politica_privacitat.html&languageid=1#");
    this.soTacHash.set("6f8e29c2c9350f886ffd2e21351117fe95619f7548e0eea6160ee7e03c30c718");
    this.soName.set("Community Analysis Alghorithm");
    this.soDescription.set(`Provides a secure, aggregated view of energy consumption and generation at community level.
    It computes totals and averages, identifies top consumers and surplus generators, and highlights behavioral extremes (percentiles).`);
    this.pass.set('B55272140');
  }

  startFlow() {
    return this.decryptCert().pipe(
      switchMap(() => this.askNicelyForLrn()),
      switchMap(() => this.signLP()),
      switchMap(() => this.signTAC()),
      switchMap(() => this.signSO()),
      switchMap(() => this.publishOffer()),
      switchMap(() => this.askNicelyForCompliance()),
      switchMap(() => this.publishCompliance())
    )
  }

  askNicelyForLrn() {
    return withLoading(
      this.#vcFlowV2Actions.fetchLrn_v2({
        url: this.buildFilePath('lrn'),
        vatId: requireValue(this.vatId(), "Vat ID")
      }, this.ch()), this.isLoading)
      .pipe(
        tap((resp: any) => this.lrn.set(resp))
      );
  }

  signVP() {
    const vps = [
      requireValue(this.lrn(), "Legal registration number"),
      requireValue(this.lp(), "Legal Person"),
      requireValue(this.tac(), "Terms and conditions"),
      this.so()]
      .filter((a: any): a is NonNullable<string> => !!a);

    return withLoading(
      this.#vcFlowV2Actions.signVp(
        requireValue(this.cert()?.pKey, "Private key"),
        this.buildFilePath('vp'),
        requireValue(this.did(), "Did.json url"),
        vps),
      this.isLoading)
      .pipe(
        tap((resp: any) => this.presentation.set(resp))
      );
  }

  signSO() {
    if (!this.isIncludeSO()) {
      return EMPTY;
    }
    return withLoading(
      this.#vcFlowV2Actions.signSO(
        requireValue(this.cert()?.pKey, "Private key"),
        requireValue(this.did(), "Did.json url"),
        this.builtSOInput(
          requireValue(this.baseUrl(), "Base url")
        )),
      this.isLoading)
      .pipe(
        tap((resp: any) => this.so.set(resp))
      );
  }

  signLP() {
    return withLoading(
      this.#vcFlowV2Actions.signLP(
        requireValue(this.cert()?.pKey, "Private key"),
        requireValue(this.did(), "Did.json url"),
        {
          url: this.buildFilePath('lp'),
          lrnSubject: `${this.buildFilePath('lrn')}${this.#dsConfig.subjectPostfix}`,
          countryCode: requireValue(this.countryCode(), "Country Code"),
          legalName: requireValue(this.legalName(), "Legal name"),
        }),
      this.isLoading)
      .pipe(
        tap((resp: any) => this.lp.set(resp))
      );
  }

  signTAC() {
    return withLoading(
      this.#vcFlowV2Actions.signTAC(
        requireValue(this.cert()?.pKey, "Private key"),
        requireValue(this.did(), "Did.json url"),
        {url: this.buildFilePath('tac')}),
      this.isLoading)
      .pipe(
        tap((resp: any) => this.tac.set(resp))
      );
  }

  decryptCert() {
    return withLoading(
      this.#vcFlowV2Actions.decryptCert({
        file: requireValue(this.file(), 'Certificate file'),
        pass: requireValue(this.pass(), "Certificate password")
      }), this.isLoading)
      .pipe(
        tap((resp: DecryptedCertificate) => this.cert.set(resp))
      );
  }

  askNicelyForCompliance() {
    return withLoading(
      this.#vcFlowV2Actions.fetchCompliance(
        requireValue(this.presentation(), "Verifiable Presentation"),
        {url: this.buildFilePath('compliance')},
        this.ch()
      )
        .pipe(
          tap((resp: any) => this.compliance.set(resp))),
      this.isLoading);
  }

  publishCompliance() {
    return withLoading(this.#vcFlowV2Actions.publishCompliance(
      requireValue(this.compliance(), "Compliance"),
      requireValue(this.baseUrl(), "Url to publish")
    ), this.isLoading)
      .pipe(
        tap(() => {
          this.#toast.success('Compliance published? Probably...');
        })
      )
  }

  publishOffer() {
    return withLoading(this.#vcFlowV2Actions.publishPresentation({
          lrn: requireValue(this.lrn(), "Legal Registration Number"),
          cert: requireValue(this.cert(), "Decrypted certificate"),
          tac: requireValue(this.tac(), "Terms and conditions"),
          lp: requireValue(this.lp(), "Legal Registration Number"),
          so: this.so()
        },
        requireValue(this.baseUrl(), "Publish url"),
        requireValue(this.did(), "Did.json url"))
      , this.isLoading);
  }

  builtSOInput(baseUrl: string): SOInput {
    return {
      url: joinPath(baseUrl, this.#dsConfig.fileNames_v2['so']),
      subject: requireValue(this.soSubject(), "Service Subject"),
      name: this.soName(),
      description: this.soDescription(),
      providedByUrl: `${joinPath(baseUrl, this.#dsConfig.fileNames_v2['lp'])}#subject`,
      tac: {
        "gx:URL": requireValue(this.soTacUrl(), "Terms and condition url"),
        "gx:hash": requireValue(this.soTacHash(), "Terms and condition hash")
      },
      dataAccountExport: {
        "gx:requestType": this.soRequestType(),
        "gx:accessType": 'digital',
        "gx:formatType": this.soFormatType()
      },
    };
  }

  buildFilePath(filename: string) {
    return joinPath(requireValue(this.baseUrl(), "Publish url"), this.#dsConfig.fileNames_v2[filename])
  }
}
