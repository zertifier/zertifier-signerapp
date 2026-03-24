import {Routes} from '@angular/router';
import {MainWindow} from './components/main-window/main-window';
import {VcFlowV1} from './components/v1/vc-flow-v1/vc-flow-v1';
import {VcFlowV2} from './components/v2/vc-flow-v2/vc-flow-v2';

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
            path: "",
            redirectTo: "compliance",
            pathMatch: 'full',
          },
          {
            path: 'compliance',
            loadComponent: () => import('./components/v1/compliance/compliance.v1').then(m => m.ComplianceV1),
            data: {stepIndex: 0}
          },
          {
            path: 'lnr',
            loadComponent: () => import('./components/v1/legal-registration-number/legal-registration-number.v1').then(m => m.LegalRegistrationNumberV1),
            data: {stepIndex: 1}
          },
          {
            path: 'lp',
            loadComponent: () => import('./components/v1/legal-participant/legal-participant.v1').then(m => m.LegalParticipantV1),
            data: {stepIndex: 2}
          },
          {
            path: 'tac',
            loadComponent: () => import('./components/v1/terms-and-conditions/terms-and-conditions.component.v1').then(m => m.TermsAndConditions),
            data: {stepIndex: 3}
          },
          {
            path: 'so',
            loadComponent: () => import('./components/v1/service-offering/service-offering.v1').then(m => m.ServiceOfferingV1),
            data: {stepIndex: 4}
          }
        ]
      },
      {
        path: 'v2',
        component: VcFlowV2,
        children: [
          {
            path: "",
            redirectTo: "input",
            pathMatch: 'full',
          },
          {
            path: 'input',
            loadComponent: () => import('./components/v2/user_input/userInput.v2').then(m => m.UserInputV2),
            data: {stepIndex: 0}
          },
          {
            path: 'lnr',
            loadComponent: () => import('./components/v2/legal-registration-number/legal-registration-number.v2').then(m => m.LegalRegistrationNumberV2),
            data: {stepIndex: 1}
          },
          {
            path: 'lp',
            loadComponent: () => import('./components/v2/legal_person/legal-person.v2').then(m => m.LegalPersonV2),
            data: {stepIndex: 2}
          },
          {
            path: 'tac',
            loadComponent: () => import('./components/v2/terms-and-conditions/terms-and-conditions.component.v2').then(m => m.TermsAndConditions),
            data: {stepIndex: 3}
          },
          {
            path: 'so',
            loadComponent: () => import('./components/v2/service-offering/service-offering.v2').then(m => m.ServiceOfferingV2),
            data: {stepIndex: 4}
          },
          {
            path: 'compliance',
            loadComponent: () => import('./components/v2/compliance/compliance.v2').then(m => m.ComplianceV2),
            data: {stepIndex: 5}
          }
        ]
      },
      {
        path: "",
        redirectTo: "v2",
        pathMatch: 'full',
      }
    ]
  }
];
