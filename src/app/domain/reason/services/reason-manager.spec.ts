import { TestBed } from '@angular/core/testing';

import { ReasonManager } from './reason-manager';

describe('ReasonManager', () => {
  let service: ReasonManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReasonManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
