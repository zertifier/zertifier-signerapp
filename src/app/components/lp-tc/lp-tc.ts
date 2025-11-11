import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsProvider } from '../../core/CredentialsProvider';
import { ToastService } from '../../core/ToastService';
import {FilePublisherService, ZertifierPublishFileApiModel} from '../../core/HttpPublisher';
import {map, switchMap, finalize} from 'rxjs';

@Component({
  selector: 'app-lp-tc',
  templateUrl: './lp-tc.html',
  styleUrl: './lp-tc.css',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class LpTc {
  // External mode control from parent
  readonly testMode = input(false);

  // State
  readonly isLoading = signal(false);

  // Form fields
  readonly didUrl = signal('');
  readonly name = signal('');
  readonly countryCode = signal('');
  readonly urlLegalParticipant = signal('');
  readonly urlTermsAndConditions = signal('');

  // Demo defaults
  readonly demo = {
    didUrl: 'did:web:www.zertifier.com:docs:signedTest:test',
    name: 'Test',
    countryCode: 'ES-CT',
    urlLegalParticipant: 'https://www.zertifier.com/docs/signedTest/test/legalParticipant.json',
    urlTermsAndConditions: 'https://www.zertifier.com/docs/signedTest/test/termsAndConditions.json'
  } as const;

  // Prefill form fields when testMode is active
  #prefillEffectRef = effect(() => {
    const isTest = this.testMode();
    if (isTest) {
      this.didUrl.set(this.demo.didUrl);
      this.name.set(this.demo.name);
      this.countryCode.set(this.demo.countryCode);
      this.urlLegalParticipant.set(this.demo.urlLegalParticipant);
      this.urlTermsAndConditions.set(this.demo.urlTermsAndConditions);
    } else {
      this.didUrl.set('');
      this.name.set('');
      this.countryCode.set('');
      this.urlLegalParticipant.set('');
      this.urlTermsAndConditions.set('');
    }
  });

  // Accordions state (LP and T&C)
  readonly lpExpanded = signal(false);
  readonly tcExpanded = signal(false);

  readonly showCertModal = signal(false);

  readonly httpPublisher = inject(FilePublisherService);

  readonly filePath = computed(() => this.testMode() ? 'signedTest/test/' : 'signedTest/real/');

  // Derived UI state for post-decrypt info
  readonly fileName = computed(() => this.credentialsProvider.certificateProvider.certificateFile()?.name ?? '');
  readonly maskedPassword = computed(() => {
    const len = this.credentialsProvider.certificateProvider.certificatePassword()?.length ?? 0;
    return len > 0 ? '•'.repeat(len) : '';
  });

  async copyJson(data: unknown): Promise<void> {
    try {
      const text = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      this.toast.success('JSON copied to clipboard.');
    } catch (e) {
      console.error('Copy JSON failed', e);
      this.toast.error('Could not copy JSON.');
    }
  }

  // Can decrypt when file and non-empty password are present and not loading
  readonly canDecrypt = computed(() => {
    const file = this.credentialsProvider.certificateProvider.certificateFile();
    const pass = this.credentialsProvider.certificateProvider.certificatePassword();
    return !!file && !!(pass && pass.length > 0) && !this.isLoading();
  });

  // Derived enablement state
  readonly isBuilt = computed(() => !!this.credentialsProvider.legalParticipant() && !!this.credentialsProvider.termsAndConditions());
  readonly hasCertDecrypted = computed(() => !!this.credentialsProvider.certificateProvider.privateKey() && !!this.credentialsProvider.certificateProvider.pemCert());
  readonly isAllSigned = computed(() => this.credentialsProvider.isSignedLegalParticipant() && this.credentialsProvider.isSignedTermsAndConditions());

  readonly canSign = computed(() => this.isBuilt() && this.hasCertDecrypted() && !this.isLoading());
  readonly canPublishCreds = computed(() => this.isAllSigned() && !this.isLoading());
  readonly canPublishDid = computed(() => !!this.didUrl() && this.hasCertDecrypted() && !this.isLoading());

  // Services
  protected readonly credentialsProvider = inject(CredentialsProvider);
  protected readonly toast = inject(ToastService);

  async decrypt(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.credentialsProvider.certificateProvider.decrypt();
      const info = this.credentialsProvider.certificateProvider.certificateInfo();
      console.log('Certificate decrypted:', info);
      this.toast.success('Certificate decrypted successfully.');
    } catch (error) {
      console.error('Error decrypting certificate:', error);
      this.toast.error('Could not decrypt the certificate. Check the file and password.');
    } finally {
      this.isLoading.set(false);
    }
  }

  removeCertificate(): void {
    // Ensure UI gets fully reset
    this.isLoading.set(false);
    this.showCertModal.set(false);
    this.credentialsProvider.certificateProvider.clear();
    this.toast.info('Loaded certificate has been removed.');
  }

  openCertModal(): void {
    if (this.credentialsProvider.certificateProvider.certificateInfo()) {
      this.showCertModal.set(true);
    }
  }

  closeCertModal(): void {
    this.showCertModal.set(false);
  }

  build(): void {
    let lnr = this.credentialsProvider.legalRegistrationNumber();

    if (!this.didUrl() || !this.name() || !this.countryCode() || !this.urlLegalParticipant() || !this.urlTermsAndConditions()) {
      this.toast.error('Please complete all required fields.');
      return;
    }

    if (!lnr) {
      this.toast.error('Legal Registration Number is required.');
      return;
    }

    try {
      const legalRegistrationNumberSubjectUrl = `${(lnr as any)["id"]}#subject`;

      this.credentialsProvider.buildLegalParticipant(this.didUrl(), {
        url: this.urlLegalParticipant(),
        legalRegistrationNumberSubjectUrl,
        countryCode: this.countryCode(),
        legalName: this.name()
      });

      this.credentialsProvider.buildTermsAndConditions(this.didUrl(), {
        url: this.urlTermsAndConditions()
      });

      this.toast.success('Credentials built successfully.');
    } catch (error) {
      console.error('Error building credentials:', error);
      this.toast.error('Error building credentials. Make sure all fields are complete.');
    }
  }

  async sign(): Promise<void> {
    try {
      this.isLoading.set(true);

      if (!this.credentialsProvider.legalParticipant() || !this.credentialsProvider.termsAndConditions()) {
        this.toast.error('You must build the credentials before signing them.');
        return;
      }

      if (!this.credentialsProvider.certificateProvider.privateKey()) {
        this.toast.error('Could not load the certificate. Check the file and password.');
        return;
      }

      await this.credentialsProvider.signLegalParticipant(this.didUrl());
      await this.credentialsProvider.signTermsAndConditions(this.didUrl());

      this.toast.success('Credentials signed successfully.');
    } catch (error) {
      console.error('Error signing credentials:', error);
      this.toast.error('Error signing credentials. Check the certificate and password.');
    } finally {
      this.isLoading.set(false);
    }
  }


  publishDid() {
    const jwk = this.credentialsProvider.certificateProvider.publicKeyJwk();
    const did = this.didUrl();

    if (!did || !jwk) {
      this.toast.error('You must enter a valid DID and decrypt the certificate before publishing.');
      return;
    }

    const didDoc = this.httpPublisher.buildDid({
      idDid: did,
      certificateUrl_x5u: jwk.x5u || '',
      publicKey_n: jwk.n as string,
      publicKey_e: (jwk.e as string) || 'AQAB',
      alg: (jwk.alg as string) || 'RS256',
      kty: (jwk.kty as string) || 'RSA',
      verificationMethodId: 'verification'
    });

    const files: ZertifierPublishFileApiModel[] = [
      {
        path: `${this.filePath()}did.json`,
        content: JSON.stringify(didDoc)
      }
    ];

    const didUrl = this.httpPublisher.buildFileUrl(files[0].path);

    this.isLoading.set(true);
    this.httpPublisher.publish(files).pipe(
      switchMap(() => this.httpPublisher.validateFiles(files)),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(`DID published and validated. URL:\n${didUrl}`);
        console.log('DID published and validated');
      },
      error: (err) => {
        this.toast.error(`Error publishing or validating the DID. Check:\n- ${didUrl}`);
        console.error('DID not validated: ', err);
      }
    });
  }

  publishCreds() {
    if(!this.credentialsProvider.isSignedTermsAndConditions() || !this.credentialsProvider.isSignedLegalParticipant()) {
      console.error('Creds not ready')
      this.toast.error('The credentials are not ready to publish.');
      return
    }
    const tac = JSON.stringify(this.credentialsProvider.termsAndConditions()!)
    const lp = JSON.stringify(this.credentialsProvider.legalParticipant()!)

    const files: ZertifierPublishFileApiModel[] = [
      {
        path: `${this.filePath()}termsAndConditions.json`,
        content: tac
      },
      {
        path: `${this.filePath()}legalParticipant.json`,
        content: lp
      }
    ];

    const termsUrl = this.httpPublisher.buildFileUrl(files[0].path);
    const lpUrl = this.httpPublisher.buildFileUrl(files[1].path);

    this.isLoading.set(true);
    this.httpPublisher.publish(files).pipe(
      switchMap(() => this.httpPublisher.validateFiles(files)),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(`Published and validated. URLs:\n- ${termsUrl}\n- ${lpUrl}`);
        console.log('files published and validated');
      },
      error: (err) => {
        this.toast.error(`Error publishing or validating. Check:\n- ${termsUrl}\n- ${lpUrl}`);
        console.error('files not validate: ', err);
      }
    })
  }

  publishCert() {
    if(!this.credentialsProvider.certificateProvider.pemCert()) {
      console.error('Cert not ready')
      this.toast.error('The certificate is not ready to publish.');
      return
    }
    const pem = this.credentialsProvider.certificateProvider.pemCert()!;

    const files: ZertifierPublishFileApiModel[] = [
      {
        path: `${this.filePath()}cert.pem`,
        content: pem
      }
    ];

    const certUrl = this.httpPublisher.buildFileUrl(files[0].path);

    this.isLoading.set(true);
    this.httpPublisher.publish(files).pipe(
      switchMap(() => this.httpPublisher.validateFiles(files)),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(`Certificate published and validated. URL:\n${certUrl}`);
        console.log('files published and validated')
      },
      error: (err) => {
        this.toast.error(`Error publishing or validating the certificate. Check:\n- ${certUrl}`);
        console.error('files not validate: ', err);
      }
    })
  }
}
