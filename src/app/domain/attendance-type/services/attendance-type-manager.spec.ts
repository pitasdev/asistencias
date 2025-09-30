import { TestBed } from '@angular/core/testing';

import { AttendanceTypeManager } from './attendance-type-manager';

describe('AttendanceTypeManager', () => {
  let service: AttendanceTypeManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceTypeManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
