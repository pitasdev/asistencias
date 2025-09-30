import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindFilter } from './find-filter';

describe('FindFilter', () => {
  let component: FindFilter;
  let fixture: ComponentFixture<FindFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
