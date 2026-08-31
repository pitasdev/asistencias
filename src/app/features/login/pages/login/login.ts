import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { MAX_LENGTH_DEFAULT, MSG_MAX_LENGTH_50 } from '@/app/shared/constants/validation';
import { Button } from "@/app/shared/components/ui/button";
import { Router } from '@angular/router';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';

interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [Button, FormField, UiField, UiIcon],
  templateUrl: './login.html',
  host: {
    '(keydown)': 'checkKey($event)'
  }
})
export default class Login implements OnInit {
  private readonly authManager = inject(AuthManager);
  private readonly userManager = inject(UserManager);
  private readonly router = inject(Router);

  private readonly rememberMeCheckbox = viewChild<ElementRef<HTMLInputElement>>('rememberMeCheckbox');

  protected showPassword = signal<boolean>(false);
  protected rememberMe = signal<boolean>(false);
  protected submitting = signal<boolean>(false);

  protected loginModel = signal<LoginForm>({
    username: '',
    password: ''
  });

  protected loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Usuario requerido' });
    maxLength(schemaPath.username, MAX_LENGTH_DEFAULT, { message: MSG_MAX_LENGTH_50 });
    required(schemaPath.password, { message: 'Contraseña requerida' });
    maxLength(schemaPath.password, MAX_LENGTH_DEFAULT, { message: MSG_MAX_LENGTH_50 });
  });

  ngOnInit(): void {
    if (this.userManager.activeUser()) {
      this.router.navigate(['/']);
    }
  }

  protected fieldError(field: { touched(): boolean; invalid(): boolean; errors(): Array<{ message?: string }> }): string {
    if (field.touched() && field.invalid()) {
      return field.errors()[0]?.message ?? '';
    }
    return '';
  }

  protected async login(): Promise<void> {
    this.loginForm().markAsTouched();
    if (this.loginForm().invalid()) return;

    this.submitting.set(true);

    const { username, password } = this.loginModel();
    const login = await this.authManager.login(username.toLowerCase(), password, this.rememberMe());

    this.submitting.set(false);

    if (login) {
      this.router.navigate(['/']);
    }
  }

  protected checkKey(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;

    if (this.rememberMeCheckbox()?.nativeElement === document.activeElement) {
      event.preventDefault();
      const checkboxElement = this.rememberMeCheckbox()?.nativeElement as HTMLInputElement;
      checkboxElement.checked = !checkboxElement.checked;
      this.rememberMe.set(!this.rememberMe());
    }
  }
}
