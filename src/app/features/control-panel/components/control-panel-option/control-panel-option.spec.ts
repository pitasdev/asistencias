import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlPanelOption } from './control-panel-option';

describe('ControlPanelOption', () => {
  let component: ControlPanelOption;
  let fixture: ComponentFixture<ControlPanelOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPanelOption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlPanelOption);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
