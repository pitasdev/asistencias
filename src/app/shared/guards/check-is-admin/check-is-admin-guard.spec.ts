import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkIsAdminGuard } from './check-is-admin-guard';

describe('checkIsAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkIsAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
