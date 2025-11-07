import { Component, input } from '@angular/core';
import {LpTc} from '../lp-tc/lp-tc';
import {Lrn} from '../lrn/lrn';
import {VpVc} from '../vp-vc/vp-vc';

@Component({
  selector: 'app-component-container',
  imports: [
    LpTc,
    Lrn,
    VpVc
  ],
  templateUrl: './component-container.html',
  styleUrl: './component-container.css',
})
export class ComponentContainer {
  readonly testMode = input(false);
}
