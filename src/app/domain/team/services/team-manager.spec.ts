import { TestBed } from '@angular/core/testing';

import { TeamManager } from './team-manager';

describe('TeamManager', () => {
  let service: TeamManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
