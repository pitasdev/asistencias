import { Component, inject, OnInit, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { FindFilter } from "../../components/find-filter/find-filter";
import { ReasonRequest } from '@/app/shared/models/reason/reason-request.model';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { MAX_LENGTH_DEFAULT, MSG_MAX_LENGTH_50 } from '@/app/shared/constants/validation';
import { Modal } from "@/app/shared/components/ui/modal/modal";
import { Button } from "@/app/shared/components/ui/button";
import { ConfirmModal } from "@/app/shared/components/ui/confirm-modal/confirm-modal";
import { Switch } from "@/app/shared/components/ui/switch";
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiMenu, UiMenuItem } from '@/app/shared/components/ui/menu';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { Reason } from '@/app/shared/models/reason/reason.model';

type ModalType = 'add' | 'edit';

interface ReasonForm {
  name: string;
  requiresDescription: boolean;
}

@Component({
  selector: 'app-reasons-management',
  imports: [FindFilter, FormField, Modal, Button, ConfirmModal, Switch, CdkDropList, CdkDrag, CdkDragHandle, UiEmptyState, UiField, UiIcon, UiMenu, UiPageHeader],
  templateUrl: './reasons-management.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class ReasonsManagement implements OnInit {
  private readonly userManager = inject(UserManager);
  protected readonly reasonManager = inject(ReasonManager);

  protected readonly reasonMenuItems: UiMenuItem[] = [
    { id: 'edit', label: 'Editar', icon: 'pencil' },
    { id: 'delete', label: 'Eliminar', icon: 'trash', danger: true }
  ];

  protected reasons = signal<Reason[]>([]);

  protected openModal = signal<boolean>(false);
  protected closeModal = signal<boolean>(false);
  protected modalType = signal<ModalType>('add');
  protected modalTitle = signal<string>('');
  protected selectedReason = signal<Reason | null>(null);

  protected openDeleteModal = signal<boolean>(false);

  protected reasonModel = signal<ReasonForm>({ name: '', requiresDescription: false });

  protected reasonForm = form(this.reasonModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre del motivo requerido' });
    maxLength(schemaPath.name, MAX_LENGTH_DEFAULT, { message: MSG_MAX_LENGTH_50 });
  });

  async ngOnInit(): Promise<void> {
    await this.reasonManager.getReasonsByClubId(this.userManager.activeUser()?.club.id!);
    this.reasons.set(this.reasonManager.reasons());
  }

  protected filterReasons(searchText: string): void {
    this.reasons.set(
      this.reasonManager.reasons()
        .filter(t => t.name?.toLowerCase().includes(searchText?.toLowerCase()))
    );
  }

  protected fieldError(field: { touched(): boolean; invalid(): boolean; errors(): Array<{ message?: string }> }): string {
    if (field.touched() && field.invalid()) {
      return field.errors()[0]?.message ?? '';
    }
    return '';
  }

  protected async drop(event: CdkDragDrop<Reason[]>): Promise<void> {
    const reordered = [...this.reasons()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    reordered.forEach((reason, index) => reason.order = index + 1);
    this.reasons.set(reordered);

    await this.reasonManager.updateReasons(this.reasonManager.toReasonRequest(reordered));
    this.reasons.set(this.reasonManager.reasons());
  }

  protected onReasonMenu(item: UiMenuItem, reason: Reason): void {
    switch (item.id) {
      case 'edit':
        this.showEditReasonModal(reason);
        break;
      case 'delete':
        this.showConfirmDeleteModal(reason);
        break;
    }
  }

  protected showEditReasonModal(reason: Reason): void {
    this.selectedReason.set(reason);
    this.modalType.set('edit');
    this.modalTitle.set('Modificar Motivo');
    this.reasonModel.set({ name: reason?.name!, requiresDescription: reason?.requiresDescription! });
    this.openModal.set(true);
  }

  protected async editReason(): Promise<void> {
    this.reasonForm().markAsTouched();
    if (this.reasonForm().invalid()) return;

    const { name, requiresDescription } = this.reasonModel();

    const updatedReason: ReasonRequest = {
      ...this.selectedReason()!,
      name: name.trim(),
      requiresDescription,
      clubId: this.selectedReason()?.club.id!
    };

    await this.reasonManager.updateReasons([updatedReason]);
    this.reasons.set(this.reasonManager.reasons());

    this.closeModal.set(true);
  }

  protected showConfirmDeleteModal(reason: Reason): void {
    this.selectedReason.set(reason);
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    const isActiveId: IsActiveId = {
      id: this.selectedReason()?.id!,
      isActive: false
    };
    this.deleteReason(isActiveId);
  }

  protected async deleteReason(isActiveId: IsActiveId): Promise<void> {
    await this.reasonManager.deleteReason(isActiveId, this.userManager.activeUser()?.club.id!);
    this.reasons.set(this.reasonManager.reasons());
  }

  protected showAddReasonModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Motivo');
    this.openModal.set(true);
  }

  protected async addReason(): Promise<void> {
    this.reasonForm().markAsTouched();
    if (this.reasonForm().invalid()) return;

    const { name, requiresDescription } = this.reasonModel();

    const newReason: ReasonRequest = {
      id: null,
      name: name.trim(),
      order: this.reasonManager.reasons().length + 1,
      requiresDescription,
      isActive: true,
      clubId: this.userManager.activeUser()?.club.id!
    };

    await this.reasonManager.createReason(newReason);
    this.reasons.set(this.reasonManager.reasons());

    this.closeModal.set(true);
  }

  protected modalClosed(): void {
    this.openModal.set(false);
    this.modalTitle.set('');
    this.reasonForm().reset({ name: '', requiresDescription: false });
    this.selectedReason.set(null);
    this.closeModal.set(false);
  }
}
