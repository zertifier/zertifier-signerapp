import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {ApprovedCHs, ApprovedCHsOptions} from '../../core/types/clearingHouse.types';

@Component({
  selector: 'app-legal-registration-number',
  imports: [
    FormsModule
  ],
  templateUrl: './legal-registration-number.html',
  styleUrl: './legal-registration-number.css',
})
export class LegalRegistrationNumber {
  state = inject(MainWindowGroupState);

  protected readonly ApprovedCHsOptions = ApprovedCHsOptions;

  protected onChChange(event: any) {
    this.state.lnrCH.set(event.target.value as ApprovedCHs);
  }
}
