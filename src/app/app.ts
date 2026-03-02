import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {initFlowbite} from 'flowbite';
import {ToastContainer} from './ui/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer,],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  ngOnInit(): void {
    initFlowbite();
  }
}
