import { ReasonApiClient } from '@/app/core/api-clients/reason/reason-api-client';
import { Reason } from '@/app/shared/models/reason.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReasonManager {
  private _reasons = signal<Reason[]>([]);

  reasons = this._reasons.asReadonly();

  private readonly reasonApiClient = inject(ReasonApiClient);

  async getReasonsByClubId(clubId: number) {
    const reasons = await firstValueFrom(
      this.reasonApiClient.getReasonsByClubId(clubId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._reasons.set(reasons);
  }

  findReasonById(reasonId: number): Reason | null {
    return this._reasons().find(r => r.id === reasonId) ?? null;
  }
}
