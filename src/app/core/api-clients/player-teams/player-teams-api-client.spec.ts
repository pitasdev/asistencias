import { TestBed } from '@angular/core/testing';

import { PlayerTeamsApiClient } from './player-teams-api-client';

describe('PlayerTeamsApiClient', () => {
  let service: PlayerTeamsApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerTeamsApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
