import {Routes} from '@angular/router';
import {MainWindow} from './components/main-window/main-window';
import {VcFlowV1} from './components/vc-flow-v1/vc-flow-v1';

export const routes: Routes = [
  {
    path: '',
    component: MainWindow,
    children: [
      {
        path: 'v1',
        component: VcFlowV1,
        children: [
          {
            path: 'compliance',
            loadComponent: () => import('./components/compliance/compliance').then(m => m.Compliance),
            data: {stepIndex: 0}
          },
          {
            path: 'lnr',
            loadComponent: () => import('./components/legal-registration-number/legal-registration-number').then(m => m.LegalRegistrationNumber),
            data: {stepIndex: 1}
          },
          {
            path: 'lp',
            loadComponent: () => import('./components/legal-participant/legal-participant').then(m => m.LegalParticipant),
            data: {stepIndex: 2}
          },
          {
            path: 'tac',
            loadComponent: () => import('./components/./terms-and-conditions/terms-and-conditions.component').then(m => m.TermsAndConditions),
            data: {stepIndex: 3}
          },
          {
            path: 'so',
            loadComponent: () => import('./components/./service-offering/service-offering').then(m => m.ServiceOffering),
            data: {stepIndex: 4}
          }
        ]
      },
      {
        path: 'v2',
        component: MainWindow,
        children: [
          {
            path: 'compliance',
            loadComponent: () => import('./components/compliance/compliance').then(m => m.Compliance),
            data: {stepIndex: 0}
          },
          {
            path: 'lnr',
            loadComponent: () => import('./components/legal-registration-number/legal-registration-number').then(m => m.LegalRegistrationNumber),
            data: {stepIndex: 1}
          },
          {
            path: 'lp',
            loadComponent: () => import('./components/legal-participant/legal-participant').then(m => m.LegalParticipant),
            data: {stepIndex: 2}
          },
          {
            path: 'tac',
            loadComponent: () => import('./components/./terms-and-conditions/terms-and-conditions.component').then(m => m.TermsAndConditions),
            data: {stepIndex: 3}
          },
          {
            path: 'so',
            loadComponent: () => import('./components/./service-offering/service-offering').then(m => m.ServiceOffering),
            data: {stepIndex: 4}
          }
        ]
      },
      {
        path: "",
        redirectTo: "v1",
        pathMatch: 'full',
      }
    ]
  }
];
