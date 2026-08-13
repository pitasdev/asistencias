import { ClubApiClient } from '@/app/core/api-clients/club/club-api-client';
import { Club } from '@/app/shared/models/club/club.model';
import { Season } from '@/app/shared/models/season/season.model';
import { computed, inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Service()
export class ClubManager {
  private _seasons = signal<Season[]>([]);
  private _club = signal<Club | null>(null);

  club = this._club.asReadonly();
  seasons = this._seasons.asReadonly();
  actualSeason = computed(() => {
    if (this._seasons().length === 0) return null;
    return this._seasons()[0];
  });

  private readonly clubApiClient = inject(ClubApiClient);

  async getClubById(clubId: number): Promise<void> {
    const club = await firstValueFrom(
      this.clubApiClient.getClubById(clubId)
        .pipe(
          catchError(() => of(null))
        )
    );

    this._club.set(club);
  }

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
