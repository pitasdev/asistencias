import { ReasonApiClient } from '@/app/core/api-clients/reason/reason-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
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
  private readonly infoModalManager = inject(InfoModalManager);

  async getReasonsByClubId(clubId: number) {
    const reasons = await firstValueFrom(
      this.reasonApiClient.getReasonsByClubId(clubId)
        .pipe(
          catchError(() => of([]))
        )
    );

    reasons.sort((a, b) => a.order - b.order);
    this._reasons.set(reasons);
  }

  async createReason(reason: Reason): Promise<void> {
    const response = await firstValueFrom(
      this.reasonApiClient.createReason(reason)
        .pipe(
          catchError(() => of({ isSuccess: false, message: '' }))
        )
    );

    if (response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  async updateReasons(reasons: Reason[]): Promise<void> {
    const response = await firstValueFrom(
      this.reasonApiClient.updateReasons(reasons)
        .pipe(
          catchError(() => of({ isSuccess: false, message: '' }))
        )
    );

    if (response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  async deleteReason(reasonId: number): Promise<void> {
    const response = await firstValueFrom(
      this.reasonApiClient.deleteReason(reasonId)
        .pipe(
          catchError(() => of({ isSuccess: false, message: '' }))
        )
    );

    if (!response.isSuccess) return;

    const updateReasons = this._reasons().filter(t => t.id !== reasonId);
    for (let i = 0; i < updateReasons.length; i++) {
      if (updateReasons[i].order !== i + 1) updateReasons[i].order = i + 1;
    }
    await this.updateReasons(updateReasons);

    this._reasons.set(updateReasons);

    this.infoModalManager.success(response.message!);
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

    await this.updateReasons(newReasons);
    
    this._reasons.set(newReasons);
  }
}
