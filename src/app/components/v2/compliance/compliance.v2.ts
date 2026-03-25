import {Component, computed, inject, signal} from '@angular/core';
import {ActionButton} from '../../../ui/action-button/action-button';
import {FormDivider} from '../../../ui/form-divider/form-divider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ResultBlock} from '../../../ui/result-block/result-block';
import {SideDecorator} from '../../../ui/side-decorator/side-decorator';
import {Stepper} from '../../../ui/stepper/stepper';
import {VcFlowV2State} from '../../../services/sharedState/vc-flow-v2.state';
import {FormSelector} from '../../../ui/form-selector/form-selector';
import {DogshitConfig} from '../../../core/data/dogshit.config';
import {ToastService} from '../../../services/ToastService';

@Component({
  selector: 'app-offer.v2',
  imports: [
    ActionButton,
    FormDivider,
    ReactiveFormsModule,
    ResultBlock,
    SideDecorator,
    Stepper,
    FormsModule,
    FormSelector
  ],
  templateUrl: './compliance.v2.html',
  styleUrl: './compliance.v2.css',
})
export class ComplianceV2 {
  state = inject(VcFlowV2State);
  vc = this.state.compliance;
  presentation = this.state.presentation;
  selectedDomain = signal<string>('Zertifier');
  fileUrl = computed(() => {
      return this.state.baseUrl() ? this.state.buildFilePath("compliance") : null;
    }
  )
  #dsConfig = inject(DogshitConfig);
  publishDomains = Object.keys(this.#dsConfig.publishDomains);
  #toast = inject(ToastService);

  publish() {
    this.state.publishCompliance().subscribe({
      next: () => {
        this.#toast.success('🎉 Compliance published');
      },
      error: (err) => {
        this.#toast.error('Publishing failed');
        console.error('Publishing error', err);
      }
    });
  }

  offer() {
    this.state.askNicelyForCompliance().subscribe({
      next: () => {
        this.#toast.success('🎉 Compliance received');
      },
      error: (err) => {
        this.#toast.error('Not asked nicely enough');
        console.error('No nice', err);
      }
    });
  }
}
