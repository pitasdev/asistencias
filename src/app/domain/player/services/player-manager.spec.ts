import { TestBed } from '@angular/core/testing';

import { PlayerManager } from './player-manager';

describe('PlayerManager', () => {
  let service: PlayerManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
