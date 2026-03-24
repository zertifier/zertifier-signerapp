import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {MainWindowGroupState} from '../../../services/sharedState/main-window.group.state';
import {APPROVED_CHS} from '../../../core/types/clearingHouse.types';

@Component({
  selector: 'app-legal-registration-number',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector
  ],
  templateUrl: './legal-registration-number.v1.html',
  styleUrl: './legal-registration-number.v1.css',
})
export class LegalRegistrationNumberV1 {
  state = inject(MainWindowGroupState);
  c = this.state.credentialProvider.lnr;
  protected readonly APPROVED_CHS = APPROVED_CHS;
}
