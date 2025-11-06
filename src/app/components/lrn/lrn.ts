import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {ReactiveFormsModule, NonNullableFormBuilder, FormsModule} from '@angular/forms';
import { CredentialsProvider } from '../../core/CredentialsProvider';
import { ClearingHouses, LegalRegistrationNumberInputData, ClearingHouseApiService } from '../../core/ClearingHouseApiService';
import { JsonPipe } from '@angular/common';
import { ToastService } from '../../core/ToastService';

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

  // Tabs: real | test
  mode = signal<'real' | 'test'>('real');

  // Form state
  clearingHouse = signal('GAIA_X_V1_TEST');
  vatId = signal('');
  url = signal('');
  expanded = signal(false);

  // Demo defaults
  readonly demoVatId = 'ESB05303755';
  readonly demoUrl = 'https://www.zertifier.com/docs/signedTest/legalRegistrationNumber.json';

  // Derived state
  clearingHouses = computed(() =>
    Object.keys(this.#clearingHouseService.clearingHousesRegistrationNumberUrl) as ClearingHouses[]
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

  setMode(mode: 'real' | 'test') {
    this.mode.set(mode);
    if (mode === 'test') {
      this.vatId.set(this.demoVatId);
      this.url.set(this.demoUrl);
    } else {
      this.vatId.set('');
      this.url.set('');
    }
  }

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
}
