import { Component, inject, OnInit, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { form, FormField, required } from '@angular/forms/signals';
import { Button } from "@/app/shared/components/ui/button";
import { Modal } from "@/app/shared/components/ui/modal/modal";
import { TeamRequest } from '@/app/shared/models/team/team-request.model';
import { ConfirmModal } from "@/app/shared/components/ui/confirm-modal/confirm-modal";
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { FindFilter } from "../../components/find-filter/find-filter";
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiMenu, UiMenuItem } from '@/app/shared/components/ui/menu';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { Team } from '@/app/shared/models/team/team.model';

type ModalType = 'add' | 'edit';

@Component({
  selector: 'app-teams-management',
  imports: [Button, Modal, FormField, ConfirmModal, FindFilter, CdkDropList, CdkDrag, CdkDragHandle, UiEmptyState, UiField, UiIcon, UiMenu, UiPageHeader],
  templateUrl: './teams-management.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class TeamsManagement implements OnInit {
  protected readonly teamManager = inject(TeamManager);
  protected readonly userManager = inject(UserManager);

  protected readonly teamMenuItems: UiMenuItem[] = [
    { id: 'edit', label: 'Editar', icon: 'pencil' },
    { id: 'delete', label: 'Eliminar', icon: 'trash', danger: true }
  ];

  protected teams = signal<Team[]>([]);

  protected openModal = signal<boolean>(false);
  protected closeModal = signal<boolean>(false);
  protected modalType = signal<ModalType>('add');
  protected modalTitle = signal<string>('');
  protected selectedTeam = signal<Team | null>(null);

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');

  protected teamModel = signal({ name: '' });

  protected teamForm = form(this.teamModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre del equipo requerido' });
  });

  async ngOnInit(): Promise<void> {
    await this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.club.id!);
    this.teams.set(this.teamManager.allTeams());
  }

  protected filterTeams(searchText: string): void {
    this.teams.set(
      this.teamManager.allTeams()
        .filter(t => t.name?.toLowerCase().includes(searchText?.toLowerCase()))
    );
  }

  protected fieldError(field: { touched(): boolean; invalid(): boolean; errors(): Array<{ message?: string }> }): string {
    if (field.touched() && field.invalid()) {
      return field.errors()[0]?.message ?? '';
    }
    return '';
  }

  protected async drop(event: CdkDragDrop<Team[]>): Promise<void> {
    const reordered = [...this.teams()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    reordered.forEach((team, index) => team.order = index + 1);
    this.teams.set(reordered);

    await this.teamManager.updateTeams(this.teamManager.toTeamRequest(reordered));
    this.teams.set(this.teamManager.allTeams());
  }

  protected onTeamMenu(item: UiMenuItem, team: Team): void {
    switch (item.id) {
      case 'edit':
        this.showEditTeamModal(team);
        break;
      case 'delete':
        this.showConfirmDeleteModal(team);
        break;
    }
  }

  protected showEditTeamModal(team: Team): void {
    this.selectedTeam.set(team);
    this.modalType.set('edit');
    this.modalTitle.set('Modificar Equipo');
    this.teamModel.set({ name: team?.name! });
    this.openModal.set(true);
  }

  protected async editTeam(): Promise<void> {
    this.teamForm().markAsTouched();
    if (this.teamForm().invalid()) return;

    const updatedTeam: Team = {
      ...this.selectedTeam()!,
      name: this.teamModel().name.trim()
    };

    await this.teamManager.updateTeams(this.teamManager.toTeamRequest([updatedTeam]));
    this.teams.set(this.teamManager.allTeams());

    this.closeModal.set(true);
  }

  protected showConfirmDeleteModal(team: Team): void {
    this.selectedTeam.set(team);
    this.deleteModalText.set(`¿Está seguro de que desea eliminar el equipo <strong>${team.name}</strong>?`);
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    const isActiveId: IsActiveId = {
      id: this.selectedTeam()?.id!,
      isActive: false
    };
    this.deleteTeam(isActiveId);
  }

  protected async deleteTeam(isActiveId: IsActiveId): Promise<void> {
    await this.teamManager.deleteTeam(isActiveId, this.userManager.activeUser()?.club.id!);
    this.deleteModalText.set('');
    this.teams.set(this.teamManager.allTeams());
  }

  protected showAddTeamModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Equipo');
    this.openModal.set(true);
  }

  protected async addTeam(): Promise<void> {
    this.teamForm().markAsTouched();
    if (this.teamForm().invalid()) return;

    const newTeam: TeamRequest = {
      id: null,
      name: this.teamModel().name.trim(),
      order: this.teamManager.allTeams().length + 1,
      isActive: true,
      clubId: this.userManager.activeUser()?.club.id!
    };

    await this.teamManager.createTeam(newTeam);
    this.teams.set(this.teamManager.allTeams());

    this.closeModal.set(true);
  }

  protected modalClosed(): void {
    this.openModal.set(false);
    this.modalTitle.set('');
    this.teamForm().reset({ name: '' });
    this.selectedTeam.set(null);
    this.closeModal.set(false);
  }
}
