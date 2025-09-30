import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkDefaultPasswordGuard } from './check-default-password-guard';

describe('checkDefaultPasswordGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkDefaultPasswordGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
