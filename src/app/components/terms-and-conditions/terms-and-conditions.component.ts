import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [
    FormsModule
  ],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css',
})
export class TermsAndConditions {
  state = inject(MainWindowGroupState);
}
