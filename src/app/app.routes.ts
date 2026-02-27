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
        // Using lazy loading for the child components
        loadComponent: () => import('./components/compliance/compliance').then(m => m.Compliance)
      },
      {
        path: 'lnr',
        // Using lazy loading for the child components
        loadComponent: () => import('./components/legal-registration-number/legal-registration-number').then(m => m.LegalRegistrationNumber)
      },
      {
        path: 'lp',
        // Using lazy loading for the child components
        loadComponent: () => import('./components/legal-participant/legal-participant').then(m => m.LegalParticipant)
      },
      {
        path: 'tac',
        // Using lazy loading for the child components
        loadComponent: () => import('./components/terms-and-condtions/terms-and-condtions').then(m => m.TermsAndCondtions)
      }
    ]

  },
];
