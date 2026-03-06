import {Component, inject, OnInit, signal} from '@angular/core';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {REQUEST_TYPES, RequestTypes, SOInput} from '../../core/types/credential.types';
import {ToastService} from '../../services/ToastService';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../ui/form-divider/form-divider';
import {ResultBlock} from '../../ui/result-block/result-block';
import {ActionButton} from '../../ui/action-button/action-button';
import {FormSelector} from '../../ui/form-selector/form-selector';
import {requireValue} from '../../util/util';

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
export class ServiceOffering implements OnInit {
  state = inject(MainWindowGroupState);
  name = signal<string | undefined>(undefined);
  description = signal<string | undefined>(undefined);
  tacUrl = signal<string | undefined>(undefined);
  tacHash = signal<string | undefined>(undefined);
  formatType = signal<string>('application/json');
  requestType = signal<RequestTypes>('API');
  c = this.state.credentialProvider.so;
  protected readonly REQUEST_TYPES = REQUEST_TYPES;
  #toast = inject(ToastService);

  ngOnInit(): void {
    this.tacUrl.set("https://zertifier.com/politica_privacitat.html&languageid=1#");
    this.tacHash.set("6f8e29c2c9350f886ffd2e21351117fe95619f7548e0eea6160ee7e03c30c718");
    this.name.set("Community Analysis Alghorithm");
    this.description.set(`Provides a secure, aggregated view of energy consumption and generation at community level.
    It computes totals and averages, identifies top consumers and surplus generators, and highlights behavioral extremes (percentiles).`);
  }

  build() {
    const input: SOInput = {
      url: this.state.buildFilePath('so'),
      name: this.name(),
      description: this.description(),
      providedByUrl: `${this.state.buildFilePath("lp")}#subject`,
      tac: {
        "gx:URL": requireValue(this.tacUrl(), "Terms and condition url"),
        "gx:hash": requireValue(this.tacHash(), "Terms and condition hash")
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
