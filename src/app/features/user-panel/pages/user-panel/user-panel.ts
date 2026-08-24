import { Component, computed, DOCUMENT, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, required, minLength, validate } from '@angular/forms/signals';
import { Button } from "@/app/shared/components/ui/button";
import { Modal } from "@/app/shared/components/ui/modal/modal";
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiBadge } from '@/app/shared/components/ui/badge';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';

interface PasswordForm {
  actualPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NameForm {
  name: string;
}

@Component({
  selector: 'app-user-panel',
  imports: [Button, Modal, FormField, UiAvatar, UiBadge, UiField, UiIcon, UiPageHeader],
  templateUrl: './user-panel.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class UserPanel implements OnInit {
  protected requiredPasswordChange = input(false, {
    transform: (value: boolean | string | undefined) => value === true || value === 'true'
  });

  protected readonly userManager = inject(UserManager);
  protected readonly userTeamsManager = inject(UserTeamsManager);
  protected readonly roleManager = inject(RoleManager);
  private readonly authManager = inject(AuthManager);
  private readonly infoModalManager = inject(InfoModalManager);
  private readonly document = inject(DOCUMENT);

  protected validActualPassword = signal<boolean>(true);
  protected openEditNameModal = signal<boolean>(false);
  protected closeEditNameModal = signal<boolean>(false);

  protected teamsString = computed(() => {
    const joinTeams = this.userTeamsManager.activeUserUserTeams()?.teams.map(t => t.name).join(', ');
    return joinTeams ?? '';
  });
  protected teams = computed(() => this.userTeamsManager.activeUserUserTeams()?.teams ?? []);

  protected nameModel = signal<NameForm>({ name: '' });
  protected nameForm = form(this.nameModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre requerido' });
  });

  protected passwordModel = signal<PasswordForm>({
    actualPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  protected passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.actualPassword, { message: 'Contraseña actual requerida' });

    required(schemaPath.newPassword, { message: 'Nueva contraseña requerida' });
    minLength(schemaPath.newPassword, 8, { message: 'Debe contener mínimo 8 caracteres' });

    required(schemaPath.confirmPassword, { message: 'Confirmación requerida' });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.newPassword)) {
        return { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });
  });

  ngOnInit(): void {}

  protected fieldError(field: { touched(): boolean; invalid(): boolean; errors(): Array<{ message?: string }> }): string {
    if (field.touched() && field.invalid()) {
      return field.errors()[0]?.message ?? '';
    }
    return '';
  }

  protected actualPasswordInvalid(): boolean {
    const field = this.passwordForm.actualPassword();
    return field.touched() && field.invalid();
  }

  protected actualPasswordError(): string {
    if (!this.validActualPassword()) return 'Contraseña incorrecta';
    return this.fieldError(this.passwordForm.actualPassword());
  }

  protected showEditNameModal(): void {
    this.nameModel.set({ name: this.userManager.activeUser()?.name ?? '' });
    this.openEditNameModal.set(true);
  }

  protected async saveName(): Promise<void> {
    this.nameForm().markAsTouched();
    if (this.nameForm().invalid()) return;

    const trimmed = this.nameModel().name.trim();
    if (!trimmed) return;

    const response = await this.userManager.updateName(this.userManager.activeUser()!.id!, trimmed);
    if (response) {
      this.closeEditNameModal.set(true);
    }
  }

  protected nameModalClosed(): void {
    this.openEditNameModal.set(false);
    this.closeEditNameModal.set(false);
    this.nameForm().reset({ name: '' });
  }

  protected async checkActualPassword(): Promise<void> {
    const actualPassword = this.passwordForm.actualPassword().value();

    if (!actualPassword) {
      this.validActualPassword.set(true);
      return;
    }

    const isValid = await this.userManager.checkPassword(this.userManager.activeUser()!.id!, actualPassword);
    this.validActualPassword.set(isValid);
  }

  protected async changePassword(): Promise<void> {
    this.passwordForm().markAsTouched();
    if (this.passwordForm().invalid()) return;

    const { actualPassword, newPassword } = this.passwordModel();

    await this.checkActualPassword();
    if (!this.validActualPassword()) {
      this.infoModalManager.warning('Contraseña actual incorrecta');
      return;
    }

    if (newPassword === actualPassword) {
      this.infoModalManager.warning('La nueva contraseña debe de ser diferente a la actual');
      return;
    }

    const response = await this.userManager.updatePassword(
      this.userManager.activeUser()!.id!,
      actualPassword,
      newPassword
    );

    if (response) {
      (this.document.activeElement as HTMLElement)?.blur();
      this.passwordForm().reset({ actualPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  protected logout(): void {
    this.authManager.logout();
  }
}
