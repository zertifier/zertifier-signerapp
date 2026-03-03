import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-legal-participant',
  imports: [
    FormsModule,
    JsonPipe
  ],
  templateUrl: './legal-participant.html',
  styleUrl: './legal-participant.css',
})
export class LegalParticipant {
  state = inject(MainWindowGroupState);
}
