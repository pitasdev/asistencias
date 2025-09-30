import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { appDataResolver } from './app-data-resolver';

describe('appDataResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => appDataResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
