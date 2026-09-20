import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './shared/interceptors/credentials/credentials-interceptor';
import { authInterceptor } from './shared/interceptors/auth/auth-interceptor';
import { errorHandlingInterceptor } from './shared/interceptors/error-handling/error-handling-interceptor';
import { AuthManager } from './domain/auth/services/auth-manager';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([credentialsInterceptor, authInterceptor, errorHandlingInterceptor])),
    provideAppInitializer(() => {
      const authManager = inject(AuthManager);
      return authManager.restoreSession();
    })
  ]
};
