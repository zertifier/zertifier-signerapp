import { ChangeDetectionStrategy, Component, computed, inject, signal, input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { CredentialsProvider } from '../../core/CredentialsProvider';
import { ToastService } from '../../core/ToastService';
import { FilePublisherService, ZertifierPublishFileApiModel } from '../../core/HttpPublisher';
import { finalize, switchMap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClearingHouseApiService, ClearingHouses } from '../../core/ClearingHouseApiService';

@Component({
  selector: 'app-vp-vc',
  imports: [JsonPipe, ReactiveFormsModule, FormsModule],
  templateUrl: './vp-vc.html',
  styleUrl: './vp-vc.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VpVc {
  // External mode control from parent
  readonly testMode = input(false);
  credentialsProvider = inject(CredentialsProvider);
  #toast = inject(ToastService);
  #httpPublisher = inject(FilePublisherService);
  #clearingHouseService = inject(ClearingHouseApiService);

  // Local state
  publishingCompliance = signal<boolean>(false);
  // Optional custom path (folder or full file path) provided by the user
  customPublishPath = signal<string>('');
  readonly filePath = computed(() => {
    if (this.testMode()) {
      return 'signedTest/test/';
    }

    // When not in test mode, extract path from DID URL
    // DID format: did:web:www.zertifier.com:docs:signedTest:test
    // Should become: signedTest/test/
    const lp = this.credentialsProvider.legalParticipant();
    if (!lp || !lp['id']) return '';

    const didUrl = lp['id'] as string;

    try {
      // Check if DID contains zertifier.com and docs
      if (didUrl.includes('zertifier.com') && didUrl.includes(':docs:')) {
        // Extract everything after ':docs:'
        const docsIndex = didUrl.indexOf(':docs:');
        if (docsIndex !== -1) {
          let path = didUrl.substring(docsIndex + 6); // +6 to skip ':docs:'
          // Convert colons to slashes
          path = path.replace(/:/g, '/');
          return path.endsWith('/') ? path : path + '/';
        }
      }
    } catch (e) {
      console.error('Error parsing DID URL for filePath:', e);
    }

    return '';
  });

  // Target path for the compliance file, respecting user override when present
  readonly targetCompliancePath = computed(() => {
    const override = (this.customPublishPath() || '').trim();
    if (override.length > 0) {
      // If user provided a full filename, keep it. Otherwise, treat as folder and append compliance.json
      const hasJson = /\.json$/i.test(override);
      const normalized = override.replace(/\\/g, '/');
      if (hasJson) return normalized;
      return normalized.endsWith('/') ? `${normalized}compliance.json` : `${normalized}/compliance.json`;
    }
    return `${this.filePath()}compliance.json`;
  });

  readonly targetComplianceUrl = computed(() => this.#httpPublisher.buildFileUrl(this.targetCompliancePath()));

  // Accordion state (match LRN/LP-TC pattern)
  expandedVp = signal<boolean>(false);
  expandedVc = signal<Set<number>>(new Set());
  expandedOffer = signal<boolean>(false);

  // Form state
  clearingHouse = signal<ClearingHouses>(ClearingHouses.DELTA_DAO);

  // Derived state
  clearingHouses = Object.keys(this.credentialsProvider.clearingHouseApiService.clearingHousesCredentialsOfferUrl) as ClearingHouses[];

  async copyJson(data: unknown): Promise<void> {
    try {
      const text = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      this.#toast.success('JSON copied to clipboard.');
    } catch (e) {
      console.error('Copy JSON failed', e);
      this.#toast.error('Could not copy JSON.');
    }
  }

  toggleVp() {
    this.expandedVp.update(v => !v);
  }

  toggleOffer() {
    this.expandedOffer.update(v => !v);
  }

  isVcExpanded(i: number): boolean {
    return this.expandedVc().has(i);
  }

  toggleVc(i: number) {
    this.expandedVc.update(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  // Heuristic compliance detector for offer response
  isCompliant(res: unknown): boolean | null {
    const r = res as Record<string, unknown> | null;
    if (!r) return null;
    if (typeof r["isCompliant"] === 'boolean') return r["isCompliant"] as boolean;
    if (typeof r["compliant"] === 'boolean') return r["compliant"] as boolean;
    if (typeof r["status"] === 'string') {
      const s = (r["status"] as string).toLowerCase();
      if (s.includes('compliant') || s === 'ok' || s === 'success') return true;
      if (s.includes('non') || s.includes('fail') || s.includes('error')) return false;
    }
    return null;
  }

  onOffer() {
    if (this.credentialsProvider.isOffering()) return;

    const lrn = this.credentialsProvider.legalRegistrationNumber();

    if (!lrn || !lrn["id"]) {
      this.#toast.error('No LRN available to offer. Fetch it first.');
      return;
    }

    this.credentialsProvider.offerPresentation(lrn["id"], this.clearingHouse());
  }

  publishCompliance() {
    const compliance = this.credentialsProvider.complianceVerifiableCredentials();
    if (!compliance) {
      this.#toast.error('No compliance response available to publish.');
      return;
    }

    const content = JSON.stringify(compliance);
    const files: ZertifierPublishFileApiModel[] = [
      {
        path: this.targetCompliancePath(),
        content
      }
    ];

    const url = this.targetComplianceUrl();

    this.publishingCompliance.set(true);
    this.#httpPublisher
      .publish(files)
      .pipe(
        switchMap(() => this.#httpPublisher.validateFiles(files)),
        finalize(() => this.publishingCompliance.set(false))
      )
      .subscribe({
        next: () => {
          this.#toast.success(`Compliance published and validated. URL:\n${url}`);
        },
        error: (err) => {
          console.error('Error publicando/validando compliance:', err);
          this.#toast.error(`Error publishing or validating compliance. Check:\n- ${url}`);
        }
      });
  }
}
