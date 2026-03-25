import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {Stepper} from '../../../ui/stepper/stepper';
import {APPROVED_CHS} from '../../../core/types/clearingHouse.types';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';

@Component({
  selector: 'app-compliance',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector,
    Stepper,
    SideDecorator
  ],
  templateUrl: './userInput.v2.html',
  styleUrl: './userInput.v2.css',
})
export class UserInputV2 {
  state = inject(VcFlowV2State);
  compliance = this.state.credentialProvider.compliance;
  decryptedCertificate = this.state.credentialProvider.cert;
  protected readonly APPROVED_CHS = APPROVED_CHS;

  onFileSelect(event: any) {
    const f = event.target.files[0];
    if (f) {
      this.state.file.set(f);
    }
  }

  startFlow() {
    this.state.startFlow();
  }

  protected decryptCert() {
    this.state.decryptCert()
  }
}
