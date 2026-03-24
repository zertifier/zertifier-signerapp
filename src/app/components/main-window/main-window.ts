import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MainWindowGroupState} from '../../services/sharedState/main-window.group.state';
import {CertificateProvider} from '../../core/CertificateProvider';
import {CredentialsProvider} from '../../core/CredentialsProvider';
import {PublishService} from '../../services/publishers/PublishService';

@Component({
  selector: 'app-main-window',
  imports: [RouterModule],
  providers: [MainWindowGroupState, CredentialsProvider, CertificateProvider, PublishService],
  templateUrl: './main-window.html',
  styleUrl: './main-window.css',
})
export class MainWindow {
}
