import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {MainWindowGroupState} from '../../../services/sharedState/main-window.group.state';
import {DogshitConfig} from '../../../core/data/dogshit.config';

@Component({
  selector: 'app-compliance',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector
  ],
  templateUrl: './compliance.v1.html',
  styleUrl: './compliance.v1.css',
})
export class ComplianceV1 {
  state = inject(MainWindowGroupState);
  c = this.state.credentialProvider.compliance;
  vpOffer = this.state.credentialProvider.presentation;
  decryptedCertificate = this.state.credentialProvider.cert;
  selectedDomain = signal<string>('Zertifier');
  protected readonly Object = Object;
  #dsConfig = inject(DogshitConfig);
  publishDomains = Object.keys(this.#dsConfig.publishDomains);

  onFileSelect(event: any) {
    const f = event.target.files[0];
    if (f) {
      this.state.file.set(f);
    }
  }

  publishOffer() {
    this.state.publishOffer();
  }

  getCompliance() {
    this.state.fetchCompliance();
  }
}
