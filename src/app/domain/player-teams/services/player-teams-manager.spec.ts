import { TestBed } from '@angular/core/testing';

import { PlayerTeamsManager } from './player-teams-manager';

describe('PlayerTeamsManager', () => {
  let service: PlayerTeamsManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerTeamsManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
