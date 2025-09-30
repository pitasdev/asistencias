import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancesControl } from './attendances-control';

describe('AttendancesControl', () => {
  let component: AttendancesControl;
  let fixture: ComponentFixture<AttendancesControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancesControl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancesControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
