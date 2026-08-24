import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiIcon } from './icon';

/**
 * Cabecera de página: botón de retorno opcional + título + subtítulo + acciones a la derecha.
 */
@Component({
  selector: 'app-ui-page-header',
  imports: [RouterLink, UiIcon],
  template: `
    <header class="flex items-center gap-4">
      @if (backLink()) {
        <a
          [routerLink]="backLink()"
          class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-slate-500 shadow-card transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-95"
          aria-label="Volver"
        >
          <app-ui-icon name="chevron-left" [size]="20" />
        </a>
      }

      <div class="min-w-0 flex-1">
        <h1 class="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm leading-snug text-slate-400">{{ subtitle() }}</p>
        }
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <ng-content select="[actions]" />
      </div>
    </header>
  `
})
export class UiPageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly backLink = input<string>('');
}
