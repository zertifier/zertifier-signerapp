import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {VcFlowV2Actions} from '../../../core/VcFlowV2.actions';

@Component({
  host: {
    class: "flex flex-col grow"
  },
  selector: 'app-vc-flow-v1',
  imports: [RouterModule],
  providers: [VcFlowV2Actions, VcFlowV2State],
  templateUrl: './vc-flow-v2.html',
  styleUrl: './vc-flow-v2.css',
})
export class VcFlowV2 {

}
