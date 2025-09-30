import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersManagement } from './players-management';

describe('PlayersManagement', () => {
  let component: PlayersManagement;
  let fixture: ComponentFixture<PlayersManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
