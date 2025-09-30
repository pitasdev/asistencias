import { TestBed } from '@angular/core/testing';

import { AuthApiClient } from './auth-api-client';

describe('AuthApiClient', () => {
  let service: AuthApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
