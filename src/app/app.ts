import { ChangeDetectionStrategy, Component, DOCUMENT, inject, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { UserManager } from './domain/user/services/user-manager';
import { Loader } from "./shared/components/loader/loader";
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  protected isLoading = signal(false);
  private navigationEnd = false;

  protected readonly userManager = inject(UserManager);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);

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

    const clientWidth: number = this.document.body.clientWidth;
    if (clientWidth < 480) {
      const scale: number = clientWidth / 480;
      this.meta.updateTag({ name: 'viewport', content: `width=device-width, initial-scale=${scale}` });
    }
  }
}
