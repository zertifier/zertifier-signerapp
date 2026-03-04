import {Component, input} from '@angular/core';

@Component({
  selector: 'app-form-divider',
  imports: [],
  templateUrl: './form-divider.html',
  styleUrl: './form-divider.css',
})
export class FormDivider {
  label = input<string>('');
}
