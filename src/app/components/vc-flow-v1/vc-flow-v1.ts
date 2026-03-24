import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  host:{
    class: "flex flex-col grow"
  },
  selector: 'app-vc-flow-v1',
  imports: [RouterModule],
  templateUrl: './vc-flow-v1.html',
  styleUrl: './vc-flow-v1.css',
})
export class VcFlowV1 {

}
