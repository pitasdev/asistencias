import { TestBed } from '@angular/core/testing';

import { UserTeamsApiClient } from './user-teams-api-client';

describe('UserTeamsApiClient', () => {
  let service: UserTeamsApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTeamsApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
