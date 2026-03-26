import {Component, computed, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {Stepper} from '../../../ui/stepper/stepper';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {ToastService} from '../../../services/ToastService';
import {DecodeJwt} from '../../../util/decodeJwt.pipe';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    Stepper,
    SideDecorator,
    DecodeJwt
  ],
  templateUrl: './terms-and-conditions.component.v2.html',
  styleUrl: './terms-and-conditions.component.v2.css',
})
export class TermsAndConditions {
  state = inject(VcFlowV2State);
  vc = this.state.tac;
  fileUrl = computed(() => {
      return this.state.baseUrl() ? this.state.buildFilePath("tac") : null;
    }
  )
  #toast = inject(ToastService);

  sign() {
    this.state.signTAC().subscribe({
      next: () => {
        this.#toast.success('🎉 Terms and Conditions signed');
      },
      error: (err) => {
        this.#toast.error('Signing failed');
        console.error('Signing error', err);
      }
    });
  }
}
