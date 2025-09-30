import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-search-filters',
  imports: [],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFilters {
  protected showFilters = signal<boolean>(true);

  protected toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  };
}
