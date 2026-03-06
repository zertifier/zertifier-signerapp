import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ToastContainer} from './ui/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer,],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
}
