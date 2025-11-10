import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ToastContainer } from './ui/toast-container';
import {CredentialsProvider} from './core/CredentialsProvider';
import {ComponentContainer} from './components/component-container/component-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, ComponentContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('zertifier-signerapp');

  // Controls visibility of the bottom debug/test area
  readonly showTestArea = signal(false);
  toggleTestArea(): void {
    this.showTestArea.update(v => !v);
  }

  // credentialsProvider = inject(CredentialsProvider);
  ngOnInit(): void {
    initFlowbite();
  }
}
