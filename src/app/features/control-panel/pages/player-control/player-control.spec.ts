import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerControl } from './player-control';

describe('PlayerControl', () => {
  let component: PlayerControl;
  let fixture: ComponentFixture<PlayerControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerControl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
