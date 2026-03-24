import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MainWindowGroupState} from '../../../services/sharedState/main-window.group.state';

@Component({
  host:{
    class: "flex flex-col grow"
  },
  selector: 'app-vc-flow-v1',
  imports: [RouterModule],
  providers: [MainWindowGroupState],
  templateUrl: './vc-flow-v1.html',
  styleUrl: './vc-flow-v1.css',
})
export class VcFlowV1 {

}
