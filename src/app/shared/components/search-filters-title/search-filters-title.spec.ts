import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFiltersTitle } from './search-filters-title';

describe('SearchFiltersTitle', () => {
  let component: SearchFiltersTitle;
  let fixture: ComponentFixture<SearchFiltersTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFiltersTitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchFiltersTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
