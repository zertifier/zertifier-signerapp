import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {LpTc} from '../lp-tc/lp-tc';
import {Lrn} from '../lrn/lrn';
import {VpVc} from '../vp-vc/vp-vc';
import {CredentialsProvider} from '../../core/CredentialsProvider';
import {CertificateProvider} from '../../core/CertificateProvider';

@Component({
  selector: 'app-component-container',
  imports: [
    LpTc,
    Lrn,
    VpVc
  ],
  providers: [CredentialsProvider, CertificateProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './component-container.html',
  styleUrl: './component-container.css',
})
export class ComponentContainer {
  readonly testMode = input(false);
  // Layout-only flag to force vertical stacking (mobile-like) without enabling test data behavior
  readonly stackLayout = input(false);
}
