import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancesControlFilter } from './attendances-control-filter';

describe('AttendancesControlFilter', () => {
  let component: AttendancesControlFilter;
  let fixture: ComponentFixture<AttendancesControlFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancesControlFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancesControlFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
