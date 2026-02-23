import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {initFlowbite} from 'flowbite';
import {ToastContainer} from './ui/toast-container';
import {ComponentContainer} from './components/component-container/component-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, ComponentContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit { // NOTE added OnInit here
  // Controls visibility of the bottom debug/test area
  readonly showTestArea = signal(false);
  // NOTE title is not used and its a signal LMAO
  protected readonly title = signal('zertifier-signerapp');

  toggleTestArea(): void {
    this.showTestArea.update(v => !v);
  }

  // credentialsProvider = inject(CredentialsProvider);
  // NOTE ngOnInit not working without interface onInit I suspect, potentially a bug
  ngOnInit(): void {
    initFlowbite();
  }
}
