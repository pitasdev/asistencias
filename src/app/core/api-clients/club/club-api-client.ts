import { Season } from '@/app/shared/models/season.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class ClubApiClient {
  private readonly http = inject(HttpClient);

  getSeasonsByClubId(clubId: number): Observable<Season[]> {
    return this.http.get<Season[]>(`${environment.baseUrlApi}/club/${clubId}/seasons`);
  }
}