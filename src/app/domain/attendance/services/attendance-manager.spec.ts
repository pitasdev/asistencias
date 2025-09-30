import { TestBed } from '@angular/core/testing';

import { AttendanceManager } from './attendance-manager';

describe('AttendanceManager', () => {
  let service: AttendanceManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
