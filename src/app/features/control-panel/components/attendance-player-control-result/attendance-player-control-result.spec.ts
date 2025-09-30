import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancePlayerControlResult } from './attendance-player-control-result';

describe('AttendancePlayerControlResult', () => {
  let component: AttendancePlayerControlResult;
  let fixture: ComponentFixture<AttendancePlayerControlResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancePlayerControlResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancePlayerControlResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
