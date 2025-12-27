import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "@/app/shared/components/button/button";
import { Modal } from "@/app/shared/components/modal/modal";
import { Team } from '@/app/shared/models/team.model';
import { ConfirmModal } from "@/app/shared/components/confirm-modal/confirm-modal";
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { FindFilter } from "../../components/find-filter/find-filter";

type ModalType = 'add' | 'edit';

@Component({
  selector: 'app-teams-management',
  imports: [FormsModule, Button, Modal, ConfirmModal, FindFilter],
  templateUrl: './teams-management.html',
  styleUrl: './teams-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TeamsManagement implements OnInit {
  protected teams = signal<Team[]>([]);

  protected openModal = signal<boolean>(false);
  protected closeModal = signal<boolean>(false);

  protected teamName = signal<string>('');
  protected modalType = signal<ModalType>('add');
  protected modalTitle = signal<string>('');
  protected selectedTeam = signal<Team | null>(null);

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');

  protected readonly teamManager = inject(TeamManager);
  protected readonly userManager = inject(UserManager);

  async ngOnInit(): Promise<void> {
    await this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.teams.set(this.teamManager.allTeams());
  }

  protected filterTeams(searchText: string): void {
    this.teams.set(
      this.teamManager.allTeams()
        .filter(t => t.name?.toLowerCase().includes(searchText?.toLowerCase()))
    );
  }

  protected orderChange(teamId: number, order: string): void {
    this.teamManager.updateSortOrder(teamId, Number(order));
  }

  protected showEditTeamModal(team: Team): void {
    this.selectedTeam.set(team);
    this.modalType.set('edit');
    this.modalTitle.set('Modificar Equipo');
    this.teamName.set(team?.name!);
    this.openModal.set(true);
  }

  protected async editTeam(): Promise<void> {
    if (!this.teamName()) return;

    const updatedTeam: Team = {
      ...this.selectedTeam()!,
      name: this.teamName().trim()
    };

    await this.teamManager.updateTeams([updatedTeam]);
    await this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.clubId!);
    
    this.closeModal.set(true);
  }

  protected showConfirmDeleteModal(team: Team): void {
    this.selectedTeam.set(team);
    this.deleteModalText.set(`¿Está seguro de que desea eliminar el equipo <strong>${team.name}</strong>?`);
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    this.deleteTeam(this.selectedTeam()?.id!);
  }

  protected async deleteTeam(teamId: number): Promise<void> {
    await this.teamManager.deleteTeam(teamId);
    this.deleteModalText.set('');
    this.teams.set(this.teamManager.allTeams());
  }

  protected showAddTeamModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Equipo');
    this.openModal.set(true);
  }

  protected async addTeam(): Promise<void> {
    if (!this.teamName()) return;

    const newTeam: Team = {
      id: null,
      name: this.teamName().trim(),
      order: this.teamManager.allTeams().length + 1,
      isActive: true,
      clubId: this.userManager.activeUser()?.clubId!
    };

    await this.teamManager.createTeam(newTeam);
    await this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.teams.set(this.teamManager.allTeams());

    this.closeModal.set(true);
  }

  protected modalClosed(): void {
    this.openModal.set(false);
    this.modalTitle.set('');
    this.teamName.set('');
    this.selectedTeam.set(null);
    this.closeModal.set(false);
  }
}
