import {Component, EventEmitter, input, Output} from '@angular/core';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  isDisabled = input<boolean>(false);
  @Output() onClick = new EventEmitter<void>();
}
