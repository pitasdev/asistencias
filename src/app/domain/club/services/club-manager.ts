import { ClubApiClient } from '@/app/core/api-clients/club/club-api-client';
import { Season } from '@/app/shared/models/season.model';
import { computed, inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Service()
export class ClubManager {
  private _seasons = signal<Season[]>([]);

  seasons = this._seasons.asReadonly();
  actualSeason = computed(() => {
    if (this._seasons().length === 0) return null;
    return this._seasons()[0];
  });

  private readonly clubApiClient = inject(ClubApiClient);

  async getSeasonsByClubId(clubId: number): Promise<void> {
    const seasons = await firstValueFrom(
      this.clubApiClient.getSeasonsByClubId(clubId)
        .pipe(
          catchError(() => of([]))
        )
    );

    seasons.sort((a, b) => a.name < b.name ? 1 : -1);
    this._seasons.set(seasons);
  }
}
