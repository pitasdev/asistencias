import { TestBed } from '@angular/core/testing';

import { AttendanceTypeApiClient } from './attendance-type-api-client';

describe('AttendanceTypeApiClient', () => {
  let service: AttendanceTypeApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceTypeApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
