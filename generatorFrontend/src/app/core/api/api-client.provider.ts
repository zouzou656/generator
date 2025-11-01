import { Provider } from '@angular/core';
import { API_CLIENT } from './api-client';
import { MockApiClient } from './mock-api.client';

export function provideApiClient(): Provider {
  return {
    provide: API_CLIENT,
    useExisting: MockApiClient
  };
}

export const API_CLIENT_PROVIDERS: Provider[] = [MockApiClient, provideApiClient()];

