import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyAttendances } from './modify-attendances';

describe('ModifyAttendances', () => {
  let component: ModifyAttendances;
  let fixture: ComponentFixture<ModifyAttendances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyAttendances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyAttendances);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
