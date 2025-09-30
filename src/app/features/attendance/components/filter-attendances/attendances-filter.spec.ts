import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancesFilter } from './attendances-filter';

describe('AttendancesFilter', () => {
  let component: AttendancesFilter;
  let fixture: ComponentFixture<AttendancesFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancesFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancesFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
