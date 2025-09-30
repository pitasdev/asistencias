import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceControlResult } from './attendance-control-result';

describe('AttendanceControlResult', () => {
  let component: AttendanceControlResult;
  let fixture: ComponentFixture<AttendanceControlResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceControlResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceControlResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
