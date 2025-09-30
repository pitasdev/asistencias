import { TestBed } from '@angular/core/testing';

import { PlayerApiClient } from './player-api-client';

describe('PlayerApiClient', () => {
  let service: PlayerApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
