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
  templateUrl: './legal-participant.v1.html',
  styleUrl: './legal-participant.v1.css',
})
export class LegalParticipantV1 {
  state = inject(MainWindowGroupState);
  c = this.state.credentialProvider.lp;
}
