import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {MainWindowGroupState} from '../../../services/sharedState/main-window.group.state';


@Component({
  selector: 'app-legal-participant',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton
  ],
  templateUrl: './legal-person.v2.html',
  styleUrl: './legal-person.v2.css',
})
export class LegalPersonV2 {
  state = inject(MainWindowGroupState);
  c = this.state.credentialProvider.lp;
}
