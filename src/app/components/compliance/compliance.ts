import {Component, inject, signal} from '@angular/core';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../ui/form-divider/form-divider';
import {ResultBlock} from '../../ui/result-block/result-block';
import {ActionButton} from '../../ui/action-button/action-button';
import {FormSelector} from '../../ui/form-selector/form-selector';
import {DogshitConfig} from '../../core/data/dogshit.config';

@Component({
  selector: 'app-compliance',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector
  ],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css',
})
export class Compliance {
  state = inject(MainWindowGroupState);
  c = this.state.credentialProvider.compliance;
  vpOffer = this.state.credentialProvider.vpOffer;
  decryptedCertificate = this.state.credentialProvider.decryptedCertificate;
  selectedDomain = signal<string>('Zertifier');
  publishPath = signal<string>("vc/1");
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
    this.state.publishOffer(this.publishPath());
  }

  offerVP() {
    this.state.offerVP(this.publishPath());
  }
}
