import { TestBed } from '@angular/core/testing';

import { ReasonApiClient } from './reason-api-client';

describe('ReasonApiClient', () => {
  let service: ReasonApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReasonApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
