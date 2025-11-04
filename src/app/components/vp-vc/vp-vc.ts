import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {CredentialsProvider} from '../../core/CredentialsProvider';
import { ToastService } from '../../core/ToastService';

@Component({
  selector: 'app-vp-vc',
  imports: [JsonPipe],
  templateUrl: './vp-vc.html',
  styleUrl: './vp-vc.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VpVc {
  credentialsProvider = inject(CredentialsProvider);
  #toast = inject(ToastService);

  // Accordion state (match LRN/LP-TC pattern)
  expandedVp = signal<boolean>(false);
  expandedVc = signal<Set<number>>(new Set());

  async copyJson(data: unknown): Promise<void> {
    try {
      const text = JSON.stringify(data, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      this.#toast.success('JSON copiado al portapapeles.');
    } catch (e) {
      console.error('Copy JSON failed', e);
      this.#toast.error('No se pudo copiar el JSON.');
    }
  }

  toggleVp() {
    this.expandedVp.update(v => !v);
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

  onOffer() {
    this.credentialsProvider.offerPresentation(
      'https://raw.githubusercontent.com/zertifier/zertifier-vc-presentation-dev/refs/heads/main/signerAppTest/legalRegistrationNumber.json'
    );
  }
}
