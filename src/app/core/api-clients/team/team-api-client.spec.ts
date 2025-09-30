import { TestBed } from '@angular/core/testing';

import { TeamApiClient } from './team-api-client';

describe('TeamApiClient', () => {
  let service: TeamApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
