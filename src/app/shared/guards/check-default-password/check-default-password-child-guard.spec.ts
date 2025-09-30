import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkDefaultPasswordChildGuard } from './check-default-password-child-guard';

describe('checkDefaultPasswordChildGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkDefaultPasswordChildGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
