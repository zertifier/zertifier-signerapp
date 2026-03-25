import {Component, computed, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {Stepper} from '../../../ui/stepper/stepper';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';


@Component({
  selector: 'app-legal-participant',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    Stepper,
    SideDecorator
  ],
  templateUrl: './legal-person.v2.html',
  styleUrl: './legal-person.v2.css',
})
export class LegalPersonV2 {
  state = inject(VcFlowV2State);
  vc = this.state.credentialProvider.lp;
  fileUrl = computed(() => {
    return this.state.baseUrl() ? this.state.buildFilePath("lp") : null;
    }
  )
}
