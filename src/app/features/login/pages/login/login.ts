import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Button } from "@/app/shared/components/button/button";
import { Router } from '@angular/router';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';

interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [Button, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: {
    '(keydown)': 'checkKey($event)'
  }
})
export default class Login implements OnInit {
  protected showPassword = signal<boolean>(false);
  protected rememberMe = signal<boolean>(false);

  protected loginModel = signal<LoginForm>({
    username: '',
    password: ''
  });

  protected loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Usuario requerido' });
    required(schemaPath.password, { message: 'Contraseña requerida' });
  });

  private rememberMeCheckbox = viewChild<ElementRef<HTMLInputElement>>('rememberMeCheckbox');

  private readonly authManager = inject(AuthManager);
  private readonly userManager = inject(UserManager);
  private readonly router = inject(Router);
  private readonly infoModalManager = inject(InfoModalManager);

  ngOnInit(): void {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (this.userManager.activeUser() || token) {
      this.router.navigate(['/']);
    }
  }

  protected async login(): Promise<void> {
    this.loginForm().markAsTouched();
    if (this.loginForm().invalid()) return;

    const { username, password } = this.loginModel();
    const login = await this.authManager.login(username.toLowerCase(), password, this.rememberMe());
    if (login) {
      this.router.navigate(['/']);
    } else {
      this.infoModalManager.error('Usuario o contraseña incorrectos');
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
