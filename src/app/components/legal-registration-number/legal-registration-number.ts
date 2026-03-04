import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {APPROVED_CHS} from '../../core/types/clearingHouse.types';
import {FormDivider} from '../../ui/form-divider/form-divider';
import {ResultBlock} from '../../ui/result-block/result-block';
import {ActionButton} from '../../ui/action-button/action-button';
import {FormSelector} from '../../ui/form-selector/form-selector';

@Component({
  selector: 'app-legal-registration-number',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector
  ],
  templateUrl: './legal-registration-number.html',
  styleUrl: './legal-registration-number.css',
})
export class LegalRegistrationNumber {
  state = inject(MainWindowGroupState);
  APPROVED_CHS = APPROVED_CHS;
  c = this.state.credentialProvider.lnr;
}
