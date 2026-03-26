import {Component, ElementRef, inject, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {ActionButton} from '../../../ui/action-button/action-button';
import {Stepper} from '../../../ui/stepper/stepper';
import {APPROVED_CHS} from '../../../core/types/clearingHouse.types';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';
import {REQUEST_TYPES} from '../../../core/types/credential.types';
import {ToastService} from '../../../services/ToastService';
import {DecodeJwt} from '../../../util/decodeJwt.pipe';

@Component({
  selector: 'app-compliance',
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
  templateUrl: './userInput.v2.html',
  styleUrl: './userInput.v2.css',
})
export class UserInputV2 {
  state = inject(VcFlowV2State);
  compliance = this.state.compliance;
  decryptedCertificate = this.state.cert;
  passInput = viewChild<ElementRef>("passInput");
  protected readonly APPROVED_CHS = APPROVED_CHS;
  protected readonly REQUEST_TYPES = REQUEST_TYPES;
  #toast = inject(ToastService);

  onFileSelect(event: any) {
    const f = event.target.files[0];
    if (f) {
      this.state.file.set(f);
    }
  }

  togglePasswordVisibility() {
    const input = this.passInput()?.nativeElement;
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  startFlow() {
    this.state.startFlow().subscribe({
      next: () => {
        this.#toast.success('🎉 Full flow completed successfully');
      },
      error: (err) => {
        this.#toast.error('Flow failed');
        console.error('Flow error', err);
      }
    });
  }

  decryptCert() {
    this.state.decryptCert().subscribe({
      next: () => {
        this.#toast.success('🎉 Certificate decrypted');
      },
      error: (err) => {
        this.#toast.error('Decryption failed');
        console.error('Decryption error', err);
      }
    });
  }
}
