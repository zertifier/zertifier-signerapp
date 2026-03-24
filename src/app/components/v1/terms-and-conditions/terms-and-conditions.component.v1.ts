import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../../services/sharedState/main-window.group.state';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton
  ],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css',
})
export class TermsAndConditions {
  state = inject(MainWindowGroupState);
  c = this.state.credentialProvider.tac;
}
