import {Component, computed, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {APPROVED_CHS} from '../../../core/types/clearingHouse.types';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {Stepper} from '../../../ui/stepper/stepper';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';
import {ToastService} from '../../../services/ToastService';
import {DecodeJwt} from '../../../util/decodeJwt.pipe';

@Component({
  selector: 'app-legal-registration-number',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector,
    Stepper,
    SideDecorator,
    DecodeJwt
  ],
  templateUrl: './legal-registration-number.v2.html',
  styleUrl: './legal-registration-number.v2.css',
})
export class LegalRegistrationNumberV2 {
  state = inject(VcFlowV2State);
  vc = this.state.lrn;
  fileUrl = computed(() => {
      return this.state.baseUrl() ? this.state.buildFilePath("lrn") : null;
    }
  )
  protected readonly APPROVED_CHS = APPROVED_CHS;
  #toast = inject(ToastService);

  askNicelyForLrn() {
    this.state.askNicelyForLrn().subscribe({
      next: () => {
        this.#toast.success('🎉 Legal registration number received');
      },
      error: (err) => {
        this.#toast.error('Not asked nicely enough');
        console.error('No nice', err);
      }
    });
  }
}
