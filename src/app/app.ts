import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { UserManager } from './domain/user/services/user-manager';
import { Loader } from './shared/components/ui/loader';
import { AppNav } from './shared/components/navigation/app-nav';
import { UiFeedbackHost } from './shared/components/ui/feedback-host/feedback-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader, AppNav, UiFeedbackHost],
  templateUrl: './app.html',})
export class App implements OnInit {
  protected readonly userManager = inject(UserManager);
  private readonly router = inject(Router);

  protected isLoading = signal(true);

  private navigationEnd = false;

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigationEnd = false;
        setTimeout(() => {
          if (!this.navigationEnd) {
            this.isLoading.set(true)
          }
        }, 50);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.navigationEnd = true;
        this.isLoading.set(false);
      }
    });
  }
}
