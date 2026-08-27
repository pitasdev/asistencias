import { ReasonApiClient } from '@/app/core/api-clients/reason/reason-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { ReasonRequest } from '@/app/shared/models/reason/reason-request.model';
import { Reason } from '@/app/shared/models/reason/reason.model';
import { inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Service()
export class ReasonManager {
  private _reasons = signal<Reason[]>([]);

  reasons = this._reasons.asReadonly();

  private readonly reasonApiClient = inject(ReasonApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async getReasonsByClubId(clubId: number, seasonId?: number) {
    const reasons = await firstValueFrom(
      this.reasonApiClient.getReasonsByClubId(clubId, seasonId)
        .pipe(
          catchError(() => of([]))
        )
    );

    reasons.sort((a, b) => a.order - b.order);
    this._reasons.set(reasons);
  }

  async createReason(reason: ReasonRequest): Promise<void> {
    const response = await firstValueFrom(
      this.reasonApiClient.createReason(reason)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
      await this.getReasonsByClubId(reason.clubId);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async updateReasons(reasons: ReasonRequest[]): Promise<void> {
    const response = await firstValueFrom(
      this.reasonApiClient.updateReasons(reasons)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
      if (reasons.length > 0) await this.getReasonsByClubId(reasons[0].clubId);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async deleteReason(isActiveId: IsActiveId, clubId: number): Promise<void> {
    const response = await firstValueFrom(
      this.reasonApiClient.deleteReason(isActiveId)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (!response || !response.isSuccess) {
      if (response && response.error) this.infoModalManager.error(response.error);
      return;
    }

    this.infoModalManager.success(response.message!);
    await this.getReasonsByClubId(clubId);
  }

  findReasonById(reasonId: number): Reason | null {
    return this._reasons().find(r => r.id === reasonId) ?? null;
  }

  async updateSortOrder(reasonId: number, order: number): Promise<void> {
    const newReasons = [...this._reasons()];
    const reasonModified = newReasons.find(t => t.id === reasonId)!;
    const oldPosition = reasonModified.order < newReasons.length ? reasonModified.order - 1 : newReasons.length - 1;
    
    newReasons.splice(oldPosition, 1);
    newReasons.splice(order - 1, 0, reasonModified);

    for (let i = 0; i < newReasons.length; i++) {
      if (newReasons[i].order !== i + 1) newReasons[i].order = i + 1;
    }

    const reasonRequest = this.toReasonRequest(newReasons);
    await this.updateReasons(reasonRequest);
  }

  toReasonRequest(reason: Reason[]): ReasonRequest[] {
    return reason.map(r => ({ ...r, clubId: r.club.id }));
  }
}
