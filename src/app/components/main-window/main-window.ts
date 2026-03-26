import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {CertificateProvider} from '../../core/CertificateProvider';
import {CredentialsProvider_v1} from '../../core/CredentialsProvider_v1';
import {PublishService} from '../../services/publishers/PublishService';

@Component({
  selector: 'app-main-window',
  imports: [RouterModule],
  providers: [MainWindowGroupState, CredentialsProvider_v1, CertificateProvider, PublishService],
  templateUrl: './main-window.html',
  styleUrl: './main-window.css',
})
export class MainWindow {
}
