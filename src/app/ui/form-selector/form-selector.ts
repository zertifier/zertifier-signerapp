import {Component, Input, input, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-form-selector',
  imports: [
    FormsModule
  ],
  templateUrl: './form-selector.html',
  styleUrl: './form-selector.css',
})
export class FormSelector<T = any> {
  label = input<string | undefined>();
  labelClass = input<string | undefined>();
  @Input() selected!: WritableSignal<T>;
  @Input() collection!: readonly T[];
}
