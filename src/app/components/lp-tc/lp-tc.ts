import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsProvider } from '../../core/CredentialsProvider';
import { ToastService } from '../../core/ToastService';
import {FilePublisherService, ZertifierPublishFileApiModel} from '../../core/HttpPublisher';
import {map, switchMap} from 'rxjs';

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
  // State
  readonly isLoading = signal(false);
  readonly didUrl = signal('did:web:raw.githubusercontent.com:zertifier:zertifier-vc-presentation-dev:main:signerAppTest:guillem');
  readonly name = signal('Test');
  readonly countryCode = signal('ES-CT');
  readonly urlLegalParticipant = signal('https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/guillem/legalParticipant.json');
  readonly urlTermsAndConditions = signal('https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/main/signerAppTest/guillem/termsAndCondition.json');

  // Accordions state (LP and T&C)
  readonly lpExpanded = signal(false);
  readonly tcExpanded = signal(false);

  readonly showCertModal = signal(false);

  readonly httpPublisher = inject(FilePublisherService);

  readonly filePath = 'signedTest/';

  // Derived UI state for post-decrypt info
  readonly fileName = computed(() => this.credentialsProvider.certificateProvider.certificateFile()?.name ?? '');
  readonly maskedPassword = computed(() => {
    const len = this.credentialsProvider.certificateProvider.certificatePassword()?.length ?? 0;
    return len > 0 ? '•'.repeat(len) : '';
  });

  async copyJson(data: unknown): Promise<void> {
    try {
      const text = JSON.stringify(data, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      this.toast.success('JSON copiado al portapapeles.');
    } catch (e) {
      console.error('Copy JSON failed', e);
      this.toast.error('No se pudo copiar el JSON.');
    }
  }

  // Can decrypt when file and non-empty password are present and not loading
  readonly canDecrypt = computed(() => {
    const file = this.credentialsProvider.certificateProvider.certificateFile();
    const pass = this.credentialsProvider.certificateProvider.certificatePassword();
    return !!file && !!(pass && pass.length > 0) && !this.isLoading();
  });

  // Services
  protected readonly credentialsProvider = inject(CredentialsProvider);
  protected readonly toast = inject(ToastService);

  async decrypt(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.credentialsProvider.certificateProvider.decrypt();
      const info = this.credentialsProvider.certificateProvider.certificateInfo();
      console.log('Certificate decrypted:', info);
      this.toast.success('Certificado descifrado correctamente.');
    } catch (error) {
      console.error('Error decrypting certificate:', error);
      this.toast.error('No se pudo descifrar el certificado. Verifica el archivo y la contraseña.');
    } finally {
      this.isLoading.set(false);
    }
  }

  removeCertificate(): void {
    // Ensure UI gets fully reset
    this.isLoading.set(false);
    this.showCertModal.set(false);
    this.credentialsProvider.certificateProvider.clear();
    this.toast.info('Se ha eliminado el certificado cargado.');
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

    if (!this.didUrl() || !this.name() || !this.countryCode() || !this.urlLegalParticipant() || !this.urlTermsAndConditions() || !lnr) {
      this.toast.error('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      this.credentialsProvider.buildLegalParticipant(this.didUrl(), {
        url: this.urlLegalParticipant(),
        // TODO WHAT IS LRN?? LRN url is not LP url, missing field
        legalRegistrationNumberSubjectUrl: `${lnr["id"]}#subject`,
        countryCode: this.countryCode(),
        legalName: this.name()
      });

      this.credentialsProvider.buildTermsAndConditions(this.didUrl(), {
        url: this.urlTermsAndConditions()
      });

      this.toast.success('Credenciales construidas correctamente.');
    } catch (error) {
      console.error('Error building credentials:', error);
      this.toast.error('Error al construir las credenciales. Verifica que todos los campos estén completos.');
    }
  }

  async sign(): Promise<void> {
    try {
      this.isLoading.set(true);

      if (!this.credentialsProvider.legalParticipant() || !this.credentialsProvider.termsAndConditions()) {
        this.toast.error('Primero debes construir las credenciales antes de firmarlas.');
        return;
      }

      if (!this.credentialsProvider.certificateProvider.privateKey()) {
        this.toast.error('No se pudo cargar el certificado. Verifica el archivo y la contraseña.');
        return;
      }

      await this.credentialsProvider.signLegalParticipant(this.didUrl());
      await this.credentialsProvider.signTermsAndConditions(this.didUrl());

      this.toast.success('Credenciales firmadas correctamente.');
    } catch (error) {
      console.error('Error signing credentials:', error);
      this.toast.error('Error al firmar las credenciales. Verifica el certificado y la contraseña.');
    } finally {
      this.isLoading.set(false);
    }
  }


  publishDid() {

  }

  publishCert() {
    if(!this.credentialsProvider.isSignedTermsAndConditions() || !this.credentialsProvider.isSignedLegalParticipant()) {
      console.error('Creds not ready')
      return
    }
    const tac = JSON.stringify(this.credentialsProvider.termsAndConditions()!)
    const lp = JSON.stringify(this.credentialsProvider.legalParticipant()!)


    const files: ZertifierPublishFileApiModel[] = [
      {
      "path": `${this.filePath}termsAndConditions.json`,
      "content": tac
    },
      {
        "path": `${this.filePath}legalParticipant.json`,
        "content": lp
      }
    ]
    this.httpPublisher.publish(files).pipe(
      switchMap((resp) => {
        return this.httpPublisher.validateFiles(files)
      })
    ).subscribe({
      next: (resp) => {
        console.log("files published and validated")
      },
      error: (err) => {
        console.error('files not validate: ', err);
      }
    })
  }

  publishCreds() {

  }
}
