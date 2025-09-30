import { TestBed } from '@angular/core/testing';

import { RoleApiClient } from './role-api-client';

describe('RoleApiClient', () => {
  let service: RoleApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
