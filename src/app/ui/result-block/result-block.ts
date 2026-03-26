import {Component, inject, input} from '@angular/core';
import {JsonPipe} from "@angular/common";
import {ToastService} from '../../services/ToastService';

@Component({
  selector: 'app-result-block',
  imports: [
    JsonPipe
  ],
  templateUrl: './result-block.html',
  styleUrl: './result-block.css',
})
export class ResultBlock {
  content = input<any>();
  #toast = inject(ToastService);

  copyToClipboard() {
    if (!this.content()) {
      this.#toast.error("Content to copy not found.", {duration: 2000});
      return;
    }
    navigator.clipboard
      .writeText(typeof this.content() === 'string' ? this.content() : JSON.stringify(this.content(), null, 2))
      .then(() => {
        this.#toast.info('Copied!', {duration: 2000});
      });
  }
}
