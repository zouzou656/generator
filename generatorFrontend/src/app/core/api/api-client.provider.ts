import { Provider } from '@angular/core';
import { API_CLIENT } from './api-client';
import { MockApiClient } from './mock-api.client';
import { RealApiClient } from './real-api.client';
import { environment } from '../../../environments/environment';

export function provideApiClient(): Provider {
  return {
    provide: API_CLIENT,
    useClass: environment.useMockApi ? MockApiClient : RealApiClient
  };
}

export const API_CLIENT_PROVIDERS: Provider[] = [provideApiClient()];

