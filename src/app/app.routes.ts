import {Routes} from '@angular/router';
import {MainWindow} from './components/main-window/main-window';

export const routes: Routes = [
  {
    path: '',
    component: MainWindow,
    children: [
      {
        path: '',
        redirectTo: 'compliance',
        pathMatch: 'full'
      },
      {
        path: 'compliance',
        loadComponent: () => import('./components/compliance/compliance').then(m => m.Compliance)
      },
      {
        path: 'lnr',
        loadComponent: () => import('./components/legal-registration-number/legal-registration-number').then(m => m.LegalRegistrationNumber)
      },
      {
        path: 'lp',
        loadComponent: () => import('./components/legal-participant/legal-participant').then(m => m.LegalParticipant)
      },
      {
        path: 'tac',
        loadComponent: () => import('./components/./terms-and-conditions/terms-and-conditions.component').then(m => m.TermsAndConditions)
      }
    ]

  },
];
