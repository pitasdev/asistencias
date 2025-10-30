import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryOfDay } from './summary-of-day';

describe('SummaryOfDay', () => {
  let component: SummaryOfDay;
  let fixture: ComponentFixture<SummaryOfDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryOfDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryOfDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
