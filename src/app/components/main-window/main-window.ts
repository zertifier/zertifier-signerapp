import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {CertificateProvider} from '../../core/CertificateProvider';
import {CredentialsProvider} from '../../core/CredentialsProvider';

@Component({
  selector: 'app-main-window',
  imports: [RouterModule],
  providers: [MainWindowGroupState, CredentialsProvider, CertificateProvider],
  templateUrl: './main-window.html',
  styleUrl: './main-window.css',
})
export class MainWindow {
  state = inject(MainWindowGroupState);
}
