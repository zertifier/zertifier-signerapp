import {Component, inject, input, signal} from '@angular/core';
import {CredentialsProvider} from '../../core/CredentialsProvider';
import {ToastService} from '../../services/ToastService';
import {CertificateProvider} from '../../core/CertificateProvider';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [],
  providers: [CredentialsProvider, CertificateProvider],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css',
})
export class TermsAndConditions {
  isLoading = signal<boolean>(false);
  didUrl = input<string>();
  tacUrl = signal<string | null>(null);
  #credProv = inject(CredentialsProvider);
  #toast = inject(ToastService);

  build() {
    if (this.isLoading()) {
      this.#toast.info("Already have started!");
      return;
    }
    const did = this.didUrl();
    if (!did) {
      this.#toast.error("did.json url is not set!");
      return;
    }
    const tacUrl = this.tacUrl();
    if (!tacUrl) {
      this.#toast.error("Tac URL is not set!");
      return;
    }
    this.#credProv.buildTAC(did, {url: tacUrl}, this.isLoading)
  }
}
