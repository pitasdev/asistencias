import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonsManagement } from './reasons-management';

describe('ReasonManagement', () => {
  let component: ReasonsManagement;
  let fixture: ComponentFixture<ReasonsManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasonsManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReasonsManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
