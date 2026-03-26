import {Component, computed, inject} from '@angular/core';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {FormsModule} from '@angular/forms';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ActionButton} from '../../../ui/action-button/action-button';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {REQUEST_TYPES} from '../../../core/types/credential.types';
import {ToastService} from '../../../services/ToastService';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';
import {Stepper} from '../../../ui/stepper/stepper';
import {DecodeJwt} from '../../../util/decodeJwt.pipe';

@Component({
  selector: 'app-service-offering',
  imports: [
    FormsModule,
    FormDivider,
    ResultBlock,
    ActionButton,
    FormSelector,
    SideDecorator,
    Stepper,
    DecodeJwt
  ],
  templateUrl: './service-offering.v2.html',
  styleUrl: './service-offering.v2.css',
})
export class ServiceOfferingV2 {
  state = inject(VcFlowV2State);
  vc = this.state.so;
  fileUrl = computed(() => {
      return this.state.baseUrl() ? this.state.buildFilePath("so") : null;
    }
  )
  protected readonly REQUEST_TYPES = REQUEST_TYPES;
  #toast = inject(ToastService);

  sign() {
    this.state.signSO().subscribe({
      next: () => {
        this.#toast.success('🎉 Service offering signed');
      },
      error: (err) => {
        this.#toast.error('Signing failed');
        console.error('Signing error', err);
      }
    });
  }
}
