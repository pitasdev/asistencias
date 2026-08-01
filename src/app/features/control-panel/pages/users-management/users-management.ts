import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Button } from "@/app/shared/components/button/button";
import { Modal } from "@/app/shared/components/modal/modal";
import { FormsModule } from '@angular/forms';
import { form, FormField, required, minLength, validate, disabled } from '@angular/forms/signals';
import { User } from '@/app/shared/models/user.model';
import { ResetPassword } from '@/app/shared/models/reset-password.model';
import { UserTeams } from '@/app/shared/models/user-teams.model';
import { Team } from '@/app/shared/models/team.model';
import { ConfirmModal } from "@/app/shared/components/confirm-modal/confirm-modal";
import { UserManager } from '@/app/domain/user/services/user-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { FindFilter } from "../../components/find-filter/find-filter";

type ModalType = 'add' | 'edit' | 'resetPassword';

interface UserForm {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  roleId: string;
}

@Component({
  selector: 'app-users-management',
  imports: [Button, Modal, FormsModule, FormField, ConfirmModal, FindFilter],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css'
})
export default class UsersManagement implements OnInit {
  protected userTeams = signal<UserTeams[]>([]);

  protected openAddModal = signal<boolean>(false);
  protected closeModal = signal<boolean>(false);
  protected modalTitle = signal<string>('');
  protected modalType = signal<ModalType>('add');
  protected selectedUser = signal<User | null>(null);
  protected teamsStringByUserId = computed(() => {
    const map = new Map<number, string>();
    for (const ut of this.userTeams()) {
      const teams = ut.teams.map(t => t.name).join(', ');
      map.set(ut.user.id!, teams);
    }
    return map;
  });
  protected canEditUserById = computed(() => {
    const superRoleId = this.roleManager.findRoleByName('super')?.id;
    const adminRoleId = this.roleManager.findRoleByName('admin')?.id;
    const activeUser = this.userManager.activeUser();

    const map = new Map<number, boolean>();
    for (const ut of this.userTeams()) {
      const user = ut.user;
      let canEdit = false;

      if (superRoleId && adminRoleId) {
        if (activeUser?.roleId === superRoleId) {
          canEdit = true;
        } else if (activeUser?.roleId === adminRoleId && activeUser?.id === user.id) {
          canEdit = true;
        } else if (activeUser?.roleId === adminRoleId) {
          canEdit = user.roleId !== adminRoleId && user.roleId !== superRoleId;
        }
      }

      map.set(user.id!, canEdit);
    }
    return map;
  });

  protected userModel = signal<UserForm>({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    roleId: '0',
  });

  protected userForm = form(this.userModel, (schemaPath) => {
    disabled(schemaPath.name, { when: () => this.modalType() === 'resetPassword' });
    required(schemaPath.name, {
      message: 'Nombre requerido',
    });

    disabled(schemaPath.username, { when: () => this.modalType() !== 'add' });
    required(schemaPath.username, {
      message: 'Username requerido',
    });

    disabled(schemaPath.password, { when: () => this.modalType() === 'edit' });
    required(schemaPath.password, {
      message: 'Contraseña requerida',
    });
    minLength(schemaPath.password, 8, {
      message: 'La contraseña debe tener al menos 8 caracteres',
    });

    disabled(schemaPath.confirmPassword, { when: () => this.modalType() === 'edit' });
    required(schemaPath.confirmPassword, {
      message: 'Confirmación requerida',
    });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.password)) {
        return { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });

    disabled(schemaPath.roleId, { when: () => this.modalType() === 'resetPassword' });
    required(schemaPath.roleId, {
      message: 'Rol requerido',
    });
  });

  protected openTeamsModal = signal<boolean>(false);
  protected closeTeamsModal = signal<boolean>(false);
  protected selectedUserTeams = signal<UserTeams | null>(null);

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');
  
  protected readonly userManager = inject(UserManager);
  protected readonly roleManager = inject(RoleManager);
  protected readonly userTeamsManager = inject(UserTeamsManager);
  protected readonly teamManager = inject(TeamManager);

  async ngOnInit(): Promise<void> {
    await this.userTeamsManager.getUserTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.userTeams.set(this.userTeamsManager.userTeams());
  }

  protected filterUsers(searchText: string): void {
    this.userTeams.set(
      this.userTeamsManager.userTeams()
        .filter(u => 
          u.user.name?.toLowerCase().includes(searchText?.toLowerCase()) ||
          u.user.username?.toLowerCase().includes(searchText?.toLowerCase())
        )
    );
  }

  protected showEditUserModal(user: User): void {
    this.selectedUser.set(user);
    this.modalType.set('edit');
    this.modalTitle.set('Editar Usuario');
    this.userModel.set({
      name: user.name,
      username: user.username,
      password: '',
      confirmPassword: '',
      roleId: String(user.roleId),
    });
    this.openAddModal.set(true);
  }

  protected showAddUserModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Usuario');
    this.userModel.set({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      roleId: String(this.roleManager.findRoleByName('user')?.id!),
    });
    this.openAddModal.set(true);
  }

  protected modalRoleChange(event: string): void {
    this.userModel.update(m => ({ ...m, roleId: event }));
  }

  protected checkFormatValidUsername(event: string): void {
    const validUsername = event.toLowerCase().replaceAll(' ', '');
    this.userModel.update(m => ({ ...m, username: validUsername }));
  }

  protected async addUser(): Promise<void> {
    this.userForm().markAsTouched();
    if (this.userForm().invalid()) return;

    const { name, username, password, roleId } = this.userModel();

    const check = await this.userManager.checkAvailableUsername(username);
    if (!check.isAvailable) return;

    const user: User = {
      id: null,
      name,
      username,
      password,
      hasDefaultPassword: true,
      roleId: Number(roleId),
      clubId: this.userManager.activeUser()?.clubId!
    };

    await this.userManager.createUser(user);
    await this.userTeamsManager.getUserTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.userTeams.set(this.userTeamsManager.userTeams());

    this.closeModal.set(true);
  }

  protected async editUser(): Promise<void> {
    this.userForm().markAsTouched();
    if (this.userForm().invalid()) return;

    const { name, roleId } = this.userModel();
    
    const updatedUser: User = {
      ...this.selectedUser()!,
      name,
      roleId: Number(roleId)
    };

    await this.userManager.updateUser(updatedUser);
    await this.userTeamsManager.getUserTeamsByClubId(this.userManager.activeUser()?.clubId!);

    this.closeModal.set(true);
  }

  protected showConfirmDeleteModal(user: User): void {
    this.selectedUser.set(user);
    this.deleteModalText.set(`¿Está seguro de que desea eliminar al usuario <strong>${user.name}</strong>?`);
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    this.deleteUser(this.selectedUser()?.id!);
  }

  protected async deleteUser(userId: number): Promise<void> {
    await this.userManager.deleteUser(userId);
    this.userTeamsManager.deleteUserTeams(userId);
    this.userTeams.set(this.userTeamsManager.userTeams());
  }

  protected showResetPasswordModal(user: User): void {
    this.modalType.set('resetPassword');
    this.modalTitle.set('Restablecer contraseña');
    this.selectedUser.set(user);
    this.userModel.set({
      name: user.name,
      username: user.username,
      password: '',
      confirmPassword: '',
      roleId: String(user.roleId),
    });
    this.openAddModal.set(true);
  }

  protected async restorePassword(): Promise<void> {
    this.userForm().markAsTouched();
    if (this.userForm().invalid()) return;

    const { password } = this.userModel();

    const resetPassword: ResetPassword = {
      id: this.selectedUser()?.id!,
      newPassword: password,
      hasDefaultPassword: true
    };

    await this.userManager.resetPassword(resetPassword);

    this.closeModal.set(true);
  }

  protected showTeamsModal(user: User): void {
    const userTeams = this.userTeamsManager.findUserTeamsByUserId(user.id!);
    this.selectedUserTeams.set(structuredClone(userTeams));
    this.openTeamsModal.set(true);
  }

  protected isSelectedTeam(teamId: number): boolean {
    if (this.selectedUserTeams()?.teams.find(t => t.id === teamId)) return true;
    else return false;
  }

  protected teamSelected(team: Team): void {
    const index = this.selectedUserTeams()?.teams.findIndex(t => t.id === team.id)!;
    if (index === -1) {
      this.selectedUserTeams()?.teams.push(team);
      this.selectedUserTeams()?.teams.sort((a, b) => a.order - b.order);
    } else {
      this.selectedUserTeams()?.teams.splice(index, 1);
    }
  }

  protected async saveTeams(): Promise<void> {
    await this.userTeamsManager.updateUserTeams(this.selectedUserTeams()!);
    this.userTeamsManager.replaceUserTeams(this.selectedUserTeams()!);
    this.closeTeamsModal.set(true);
  }

  protected cancelTeamsModal(): void {
    this.closeTeamsModal.set(true);
  }

  protected modalClosed(): void {
    this.openAddModal.set(false);
    this.selectedUser.set(null);
    this.modalTitle.set('');
    this.userForm().reset({ name: '', username: '', password: '', confirmPassword: '', roleId: '0' });
    this.closeModal.set(false);
  }

  protected teamsModalClosed(): void {
    this.openTeamsModal.set(false);
    this.selectedUserTeams.set(null);
    this.closeTeamsModal.set(false);
  }
}
