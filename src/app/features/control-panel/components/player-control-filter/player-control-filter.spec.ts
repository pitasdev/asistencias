import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerControlFilter } from './player-control-filter';

describe('PlayerControlFilter', () => {
  let component: PlayerControlFilter;
  let fixture: ComponentFixture<PlayerControlFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerControlFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerControlFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
