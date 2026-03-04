import {Component, input} from '@angular/core';
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'app-result-block',
  imports: [
    JsonPipe
  ],
  templateUrl: './result-block.html',
  styleUrl: './result-block.css',
})
export class ResultBlock {
  content = input<Object | null | undefined>();
}
