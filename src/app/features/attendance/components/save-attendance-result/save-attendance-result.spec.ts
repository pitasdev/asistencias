import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveAttendanceResult } from './save-attendance-result';

describe('SaveAttendanceResult', () => {
  let component: SaveAttendanceResult;
  let fixture: ComponentFixture<SaveAttendanceResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveAttendanceResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveAttendanceResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
