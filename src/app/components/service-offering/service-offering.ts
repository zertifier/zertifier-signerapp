import {Component, inject, signal} from '@angular/core';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {REQUEST_TYPES, RequestTypes, SOInput} from '../../core/types/credential.types';
import {ToastService} from '../../services/ToastService';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../ui/form-divider/form-divider';
import {ResultBlock} from '../../ui/result-block/result-block';
import {ActionButton} from '../../ui/action-button/action-button';
import {FormSelector} from '../../ui/form-selector/form-selector';
import {APPROVED_CHS} from '../../core/types/clearingHouse.types';

@Component({
  selector: 'app-service-offering',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector
  ],
  templateUrl: './service-offering.html',
  styleUrl: './service-offering.css',
})
export class ServiceOffering {
  state = inject(MainWindowGroupState);
  name = signal<string | undefined>(undefined);
  description = signal<string | undefined>(undefined);
  tacUrl = signal<string | undefined>(undefined);
  tacHash = signal<string | undefined>(undefined);
  formatType = signal<string>('application/json');
  requestType = signal<RequestTypes>('API');
  c = this.state.credentialProvider.so;
  protected readonly REQUEST_TYPES = REQUEST_TYPES;
  protected readonly APPROVED_CHS = APPROVED_CHS;
  #toast = inject(ToastService);

  onRequestTypeChange(event: any) {
    this.requestType.set(event.target.value);
  }

  build() {
    if (!this.state.baseUrl()) {
      this.#toast.error("Base URL is not set in the compliance");
      return;
    }
    const tacUrl = this.tacUrl();
    const hash = this.tacHash();
    if (!tacUrl || !hash) {
      this.#toast.error("Terms and conditions url and hash are not set");
      return;
    }

    const input: SOInput = {
      url: this.state.buildFileUrl('so'),
      name: this.name(),
      description: this.description(),
      providedByUrl: this.state.buildFileUrl("lp"),
      tac: {
        "gx:url": tacUrl,
        "gx:hash": hash
      },
      dataAccountExport: {
        "gx:requestType": this.requestType(),
        "gx:accessType": 'digital',
        "gx:formatType": this.formatType()
      },
    }
    this.state.buildSO(input);
  }
}
