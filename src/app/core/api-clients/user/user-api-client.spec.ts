import { TestBed } from '@angular/core/testing';

import { UserApiClient } from './user-api-client';

describe('UserApiClient', () => {
  let service: UserApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
