import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleContent } from './toggle-content';

describe('ToggleContent', () => {
  let component: ToggleContent;
  let fixture: ComponentFixture<ToggleContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
