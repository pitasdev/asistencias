import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from "@/app/shared/components/ui/button";
import { Modal } from "@/app/shared/components/ui/modal/modal";
import { form, FormField, required } from '@angular/forms/signals';
import { PlayerRequest } from '@/app/shared/models/player/player-request.model';
import { PlayerTeams } from '@/app/shared/models/player/player-teams.model';
import { ConfirmModal } from "@/app/shared/components/ui/confirm-modal/confirm-modal";
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { PlayerTeamsManager } from '@/app/domain/player-teams/services/player-teams-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { FindFilter } from "../../components/find-filter/find-filter";
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiField } from '@/app/shared/components/ui/field';
import { UiMenu, UiMenuItem } from '@/app/shared/components/ui/menu';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { Player } from '@/app/shared/models/player/player.model';
import { Team } from '@/app/shared/models/team/team.model';

type ModalType = 'add' | 'edit';

interface PlayerForm {
  name: string;
  lastName: string;
}

@Component({
  selector: 'app-players-management',
  imports: [Button, Modal, FormField, ConfirmModal, FindFilter, UiAvatar, UiEmptyState, UiField, UiMenu, UiPageHeader],
  templateUrl: './players-management.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class PlayersManagement implements OnInit {
  protected readonly playerManager = inject(PlayerManager);
  protected readonly userManager = inject(UserManager);
  protected readonly playerTeamsManager = inject(PlayerTeamsManager);
  protected readonly teamManager = inject(TeamManager);

  protected readonly playerMenuItems: UiMenuItem[] = [
    { id: 'edit', label: 'Editar', icon: 'pencil' },
    { id: 'teams', label: 'Equipos', icon: 'shirt' },
    { id: 'delete', label: 'Eliminar', icon: 'trash', danger: true }
  ];

  protected playerTeams = signal<PlayerTeams[]>([]);

  protected openEditModal = signal<boolean>(false);
  protected closeEditModal = signal<boolean>(false);
  protected modalTitle = signal<string>('');
  protected modalType = signal<ModalType>('add');
  protected selectedPlayer = signal<Player | null>(null);

  protected openTeamsModal = signal<boolean>(false);
  protected closeTeamsModal = signal<boolean>(false);
  protected selectedPlayerTeams = signal<PlayerTeams | null>(null);

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');

  protected playerModel = signal<PlayerForm>({ name: '', lastName: '' });

  protected playerForm = form(this.playerModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre requerido' });
    required(schemaPath.lastName, { message: 'Apellidos requeridos' });
  });

  private originalPlayerTeams: PlayerTeams | null = null;

  async ngOnInit(): Promise<void> {
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.club.id!);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());
  }

  protected onPlayerMenu(item: UiMenuItem, player: Player): void {
    switch (item.id) {
      case 'edit':
        this.showEditPlayerModal(player);
        break;
      case 'teams':
        this.showTeamsModal(player);
        break;
      case 'delete':
        this.showDeleteConfirmModal(player.id!);
        break;
    }
  }

  protected filterPlayers(searchText: string): void {
    this.playerTeams.set(
      this.playerTeamsManager.playerTeams()
        .filter(p =>
          p.player.name?.toLowerCase().includes(searchText?.toLowerCase()) ||
          p.player.lastName?.toLowerCase().includes(searchText?.toLowerCase())
        )
    );
  }

  protected fieldError(field: { touched(): boolean; invalid(): boolean; errors(): Array<{ message?: string }> }): string {
    if (field.touched() && field.invalid()) {
      return field.errors()[0]?.message ?? '';
    }
    return '';
  }

  protected getTeamsStringByPlayerId(playerId: number): string {
    const teams = this.playerTeamsManager.findPlayerTeamsByPlayerId(playerId)?.teams;
    const joinTeams = teams?.map(t => t.name).join(', ');
    return joinTeams ?? '';
  }

  protected showAddPlayerModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Jugador');
    this.openEditModal.set(true);
  }

  protected async addUser(): Promise<void> {
    this.playerForm().markAsTouched();
    if (this.playerForm().invalid()) return;

    const { name, lastName } = this.playerModel();

    const player: Player = {
      id: null,
      name: name.trim(),
      lastName: lastName.trim(),
      isActive: true,
      club: {
        id: this.userManager.activeUser()?.club.id!,
        name: this.userManager.activeUser()?.club.name!
      }
    };

    const playerRequest = this.toPlayerRequest(player);
    await this.playerManager.createPlayer(playerRequest);
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.club.id!);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());

    this.closeEditModal.set(true);
  }

  protected showEditPlayerModal(player: Player): void {
    this.modalType.set('edit');
    this.modalTitle.set('Editar Jugador');
    this.playerModel.set({ name: player.name, lastName: player.lastName });
    this.selectedPlayer.set(player);
    this.openEditModal.set(true);
  }

  protected async editUser(): Promise<void> {
    this.playerForm().markAsTouched();
    if (this.playerForm().invalid()) return;

    const { name, lastName } = this.playerModel();

    const player: Player = {
      ...this.selectedPlayer()!,
      name: name.trim(),
      lastName: lastName.trim()
    };

    const playerRequest = this.toPlayerRequest(player);
    await this.playerManager.updatePlayer(playerRequest);
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.club.id!);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());

    this.closeEditModal.set(true);
  }

  protected showTeamsModal(player: Player): void {
    const playerTeams = this.playerTeamsManager.findPlayerTeamsByPlayerId(player.id!);
    this.originalPlayerTeams = structuredClone(playerTeams);
    this.selectedPlayerTeams.set(structuredClone(playerTeams));
    this.openTeamsModal.set(true);
  }

  protected isSelectedTeam(teamId: number): boolean {
    if (this.selectedPlayerTeams()?.teams.find(t => t.id === teamId)) return true;
    else return false;
  }

  protected teamSelected(team: Team): void {
    const index = this.selectedPlayerTeams()?.teams.findIndex(t => t.id === team.id)!;
    if (index === -1) {
      this.selectedPlayerTeams()?.teams.push(team);
      this.selectedPlayerTeams()?.teams.sort((a, b) => a.order - b.order);
    } else {
      this.selectedPlayerTeams()?.teams.splice(index, 1);
    }
  }

  protected async saveTeams(): Promise<void> {
    const playerTeamsRequest = this.playerTeamsManager.toPlayerTeamsRequest(this.selectedPlayerTeams()!);
    await this.playerTeamsManager.updatePlayerTeams(playerTeamsRequest);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());
    this.closeTeamsModal.set(true);
  }

  protected showDeleteConfirmModal(playerId: number): void {
    this.selectedPlayer.set(this.playerTeamsManager.findPlayerTeamsByPlayerId(playerId)?.player!);
    this.deleteModalText.set(
      `Está seguro de eliminar al jugador <strong>${this.selectedPlayer()?.name} ${this.selectedPlayer()?.lastName}</strong>?`
    )
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    const isActiveId: IsActiveId = {
      id: this.selectedPlayer()?.id!,
      isActive: false
    };
    this.deletePlayer(isActiveId);
  }

  private async deletePlayer(isActiveId: IsActiveId): Promise<void> {
    await this.playerManager.deletePlayer(isActiveId);
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.club.id!);
    this.selectedPlayer.set(null);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());
  }

  protected cancelTeamsModal(): void {
    this.closeTeamsModal.set(true);
    this.playerTeamsManager.replacePlayerTeams(this.originalPlayerTeams!);
  }

  protected modalClosed(): void {
    this.openEditModal.set(false);
    this.modalTitle.set('');
    this.playerForm().reset({ name: '', lastName: '' });
    this.selectedPlayer.set(null);
    this.closeEditModal.set(false);
  }

  protected teamsModalClosed(): void {
    this.openTeamsModal.set(false);
    this.selectedPlayerTeams.set(null);
    this.originalPlayerTeams = null;
    this.closeTeamsModal.set(false);
  }

  protected toPlayerRequest(player: Player): PlayerRequest {
    return { ...player, clubId: player.club.id };
  }
}
