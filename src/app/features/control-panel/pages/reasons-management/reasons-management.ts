import { Component, inject, OnInit, signal } from '@angular/core';
import { FindFilter } from "../../components/find-filter/find-filter";
import { Reason } from '@/app/shared/models/reason.model';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { FormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { Modal } from "@/app/shared/components/modal/modal";
import { Button } from "@/app/shared/components/button/button";
import { ConfirmModal } from "@/app/shared/components/confirm-modal/confirm-modal";
import { Switch } from "@/app/shared/components/switch/switch";
import { IsActiveId } from '@/app/shared/models/is-active-id.model';

type ModalType = 'add' | 'edit';

interface ReasonForm {
  name: string;
  requiresDescription: boolean;
}

@Component({
  selector: 'app-reasons-management',
  imports: [FindFilter, FormsModule, FormField, Modal, Button, ConfirmModal, Switch],
  templateUrl: './reasons-management.html',
  styleUrl: './reasons-management.css'
})
export default class ReasonsManagement implements OnInit {
  protected reasons = signal<Reason[]>([]);

  protected openModal = signal<boolean>(false);
  protected closeModal = signal<boolean>(false);

  protected reasonModel = signal<ReasonForm>({ name: '', requiresDescription: false });

  protected reasonForm = form(this.reasonModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre del motivo requerido' });
  });

  protected modalType = signal<ModalType>('add');
  protected modalTitle = signal<string>('');
  protected selectedReason = signal<Reason | null>(null);

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');

  private readonly userManager = inject(UserManager);
  protected readonly reasonManager = inject(ReasonManager);

  async ngOnInit(): Promise<void> {
    await this.reasonManager.getReasonsByClubId(this.userManager.activeUser()?.clubId!);
    this.reasons.set(this.reasonManager.reasons());
  }

  protected filterReasons(searchText: string): void {
    this.reasons.set(
      this.reasonManager.reasons()
        .filter(t => t.name?.toLowerCase().includes(searchText?.toLowerCase()))
    );
  }

  protected async orderChange(reasonId: number, order: string): Promise<void> {
    await this.reasonManager.updateSortOrder(reasonId, Number(order));
    this.reasons.set(this.reasonManager.reasons());
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

    const updatedTeam: Reason = {
      ...this.selectedReason()!,
      name: name.trim(),
      requiresDescription
    };

    await this.reasonManager.updateReasons([updatedTeam]);
    await this.reasonManager.getReasonsByClubId(this.userManager.activeUser()?.clubId!);
    
    this.closeModal.set(true);
  }

  protected showConfirmDeleteModal(reason: Reason): void {
    this.selectedReason.set(reason);
    this.deleteModalText.set(`¿Está seguro de que desea eliminar el motivo <strong>${reason.name}</strong>?`);
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
    await this.reasonManager.deleteReason(isActiveId);
    this.deleteModalText.set('');
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

    const newReason: Reason = {
      id: null,
      name: name.trim(),
      order: this.reasonManager.reasons().length + 1,
      requiresDescription,
      isActive: true,
      clubId: this.userManager.activeUser()?.clubId!
    };

    await this.reasonManager.createReason(newReason);
    await this.reasonManager.getReasonsByClubId(this.userManager.activeUser()?.clubId!);
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
