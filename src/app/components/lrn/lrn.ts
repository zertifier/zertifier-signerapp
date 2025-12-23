import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CredentialsProvider } from '../../core/CredentialsProvider';
import { ClearingHouses, LegalRegistrationNumberInputData, ClearingHouseApiService } from '../../core/ClearingHouseApiService';
import { JsonPipe } from '@angular/common';
import { ToastService } from '../../core/ToastService';
import { FilePublisherService, ZertifierPublishFileApiModel } from '../../core/HttpPublisher';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-lrn',
  imports: [ReactiveFormsModule, FormsModule, JsonPipe],
  templateUrl: './lrn.html',
  styleUrl: './lrn.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class Lrn {
  protected credentialsProvider = inject(CredentialsProvider);
  #clearingHouseService = inject(ClearingHouseApiService);
  #toast = inject(ToastService);
  #httpPublisher = inject(FilePublisherService);

  // External mode control from parent
  readonly testMode = input(false);

  // Loading state
  isLoading = signal(false);

  // Paths
  readonly filePath = computed(() => {
    if (this.testMode()) {
      return 'signedTest/test/';
    }

    // When not in test mode, extract path from URL
    const urlValue = this.url();
    if (!urlValue) return '';

    try {
      // Check if URL contains zertifier.com/docs
      // Extract everything between /docs/ and the filename
      const docsMatch = urlValue.match(/zertifier\.com\/docs\/(.+)\/[^\/]+\.json$/);
      if (docsMatch && docsMatch[1]) {
        // Extract path after /docs/ and before the filename
        let path = docsMatch[1];
        return path.endsWith('/') ? path : path + '/';
      }
    } catch (e) {
      console.error('Error parsing URL for filePath:', e);
    }

    return '';
  });

  // Form state
  clearingHouse = signal('GAIA_X_V1_TEST');
  vatId = signal('');
  url = signal('');
  expanded = signal(false);

  // When testMode changes, prefill/clear demo values
  #prefillEffectRef = effect(() => {
    const isTest = this.testMode();
    this.vatId.set(isTest ? this.demoVatId : '');
    this.url.set(isTest ? this.demoUrl : '');
  });

  // Auto-populate from decrypted certificate
  #certPopulateEffectRef = effect(() => {
    const info = this.credentialsProvider.certificateProvider.certificateInfo();
    if (info && info.organizationIdentifier) {
      // Gaia-X usually wants the VAT ID.
      // EIDAS identifiers like VATES-B12345678 should be stripped to B12345678
      const rawId = info.organizationIdentifier;
      const vatMatch = rawId.match(/^VATES-(.+)$/i);
      const extractedVat = vatMatch ? vatMatch[1] : rawId;

      if (!this.vatId()) {
        this.vatId.set(extractedVat);
      }
    }
  });

  // Demo defaults
  readonly demoVatId = 'ESB05303755';
  readonly demoUrl = 'https://www.zertifier.com/docs/signedTest/test/legalRegistrationNumber.json';

  // Derived state
  clearingHouses = computed(() =>
    Object.keys(this.#clearingHouseService.clearingHousesCredentialsOfferUrl) as ClearingHouses[]
  );

  readonly canFetch = computed(() => {
    const vat = (this.vatId() || '').trim();
    const u = (this.url() || '').trim();
    if (!vat || !u) return false;
    try {
      const parsed = new URL(u);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  });

  async copyJson(data: unknown): Promise<void> {
    try {
      const text = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      this.#toast.success('JSON copied to clipboard.');
    } catch (e) {
      console.error('Copy JSON failed', e);
      this.#toast.error('Could not copy JSON.');
    }
  }

  onFetch() {
    const inputData: LegalRegistrationNumberInputData = {
      vatId: this.vatId(),
      url: this.url()
    };

    const clearingHouse = this.clearingHouse() as ClearingHouses;

    this.credentialsProvider.getLegalRegistrationNumber(inputData, clearingHouse);
  }

  // Enable publish only when LRN has been fetched and not loading
  readonly canPublishLrn = computed(() => !!this.credentialsProvider.legalRegistrationNumber() && !this.isLoading());

  publishLrn() {
    const lrn = this.credentialsProvider.legalRegistrationNumber();
    if (!lrn) {
      this.#toast.error('The LRN has not been fetched yet. Fetch it before publishing.');
      return;
    }

    const files: ZertifierPublishFileApiModel[] = [
      {
        path: `${this.filePath()}legalRegistrationNumber.json`,
        content: JSON.stringify(lrn)
      }
    ];

    const lrnUrl = this.#httpPublisher.buildFileUrl(files[0].path);

    this.isLoading.set(true);
    this.#httpPublisher.publish(files).pipe(
      switchMap(() => this.#httpPublisher.validateFiles(files)),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.#toast.success(`LRN published and validated. URL:\n- ${lrnUrl}`);
        console.log('LRN published and validated');
      },
      error: (err) => {
        this.#toast.error(`Error publishing or validating the LRN. Check:\n- ${lrnUrl}`);
        console.error('LRN not validated: ', err);
      }
    });
  }
}
