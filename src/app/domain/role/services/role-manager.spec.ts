import { TestBed } from '@angular/core/testing';

import { RoleManager } from './role-manager';

describe('RoleManager', () => {
  let service: RoleManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
