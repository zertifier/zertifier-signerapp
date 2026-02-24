import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {retryInterceptor} from './services/http.retry.interceptor';
import {loggingInterceptor} from './services/http.logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([loggingInterceptor, retryInterceptor]))
  ]
};
