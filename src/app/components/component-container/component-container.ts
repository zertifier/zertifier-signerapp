import {ChangeDetectionStrategy, Component, input} from '@angular/core';
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
  /* NOTE TestMode is the state of the app, stackLayout is the state of the UI.
  * as far as I understand stackLayout should be the result of the testMode or other actions
  * and they both controlled from the same place app.html.
  * Its a spaghetti of code
  * recommendation: streamline states, app.showTestArea -> testMode(why even have this) -> stackLayout
  * severity: unexpectable but medium, spaghetti's are safe until they not
  */
  readonly testMode = input(false);
  // Layout-only flag to force vertical stacking (mobile-like) without enabling test data behavior
  readonly stackLayout = input(false);
}
