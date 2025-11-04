import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { Lrn } from './components/lrn/lrn';
import { VpVc } from './components/vp-vc/vp-vc';
import { LpTc } from './components/lp-tc/lp-tc';
import { ToastContainer } from './ui/toast-container';
import {CredentialsProvider} from './core/CredentialsProvider';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Lrn, VpVc, LpTc, ToastContainer],
  templateUrl: './app.html',
  providers:[
    CredentialsProvider
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('zertifier-signerapp');

  // credentialsProvider = inject(CredentialsProvider);
  ngOnInit(): void {
    initFlowbite();
  }
}
