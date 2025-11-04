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

  clearingHouse = signal('GAIA_X_V1_TEST');
  vatId = signal('');
  url = signal('');
  expanded = signal(false);

  clearingHouses = computed(() =>
    Object.keys(this.#clearingHouseService.clearingHousesRegistrationNumberUrl) as ClearingHouses[]
  );

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
      this.#toast.success('JSON copiado al portapapeles.');
    } catch (e) {
      console.error('Copy JSON failed', e);
      this.#toast.error('No se pudo copiar el JSON.');
    }
  }

  onFetch() {
    const inputData: LegalRegistrationNumberInputData = {
      vatId: this.vatId(),
      url: this.url()
    };

    const clearingHouse = this.clearingHouse() as ClearingHouses;

    this.credentialsProvider.getLegalRegistrationNumber(inputData, clearingHouse);
    this.expanded.set(true);
  }
}
