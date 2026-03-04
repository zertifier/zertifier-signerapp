import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {APPROVED_CHS, ApprovedCHs} from '../../core/types/clearingHouse.types';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-legal-registration-number',
  imports: [
    FormsModule,
    JsonPipe
  ],
  templateUrl: './legal-registration-number.html',
  styleUrl: './legal-registration-number.css',
})
export class LegalRegistrationNumber {
  state = inject(MainWindowGroupState);

  protected readonly APPROVED_CHS = APPROVED_CHS;
}
