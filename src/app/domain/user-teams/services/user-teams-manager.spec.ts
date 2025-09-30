import { TestBed } from '@angular/core/testing';

import { UserTeamsManager } from './user-teams-manager';

describe('UserTeamsManager', () => {
  let service: UserTeamsManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTeamsManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
