import {Component, inject, signal} from '@angular/core';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {ToastService} from '../../services/ToastService';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-compliance',
  imports: [
    FormsModule,
    JsonPipe
  ],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css',
})
export class Compliance {
  state = inject(MainWindowGroupState);

  onFileSelect(event: any) {
    const f = event.target.files[0];
    if (f) {
      this.state.file.set(f);
    }
  }
}
