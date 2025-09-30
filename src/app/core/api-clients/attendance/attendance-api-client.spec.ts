import { TestBed } from '@angular/core/testing';

import { AttendanceApiClient } from './attendance-api-client';

describe('AttendanceApiClient', () => {
  let service: AttendanceApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
