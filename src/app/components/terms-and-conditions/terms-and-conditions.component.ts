import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [
    FormsModule,
    JsonPipe
  ],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css',
})
export class TermsAndConditions {
  state = inject(MainWindowGroupState);
}
