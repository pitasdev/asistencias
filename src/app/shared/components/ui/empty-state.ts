import { Component, input } from '@angular/core';
import { UiIcon, IconName } from './icon';

/** Estado vacío ilustrado para listas y secciones sin datos. */
@Component({
  selector: 'app-ui-empty-state',
  imports: [UiIcon],
  template: `
    <div class="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span class="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <app-ui-icon [name]="icon()" [size]="26" />
      </span>

      <div class="flex flex-col gap-1">
        <p class="font-semibold text-slate-700">{{ title() }}</p>
        @if (message()) {
          <p class="mx-auto max-w-64 text-sm leading-relaxed text-slate-400">{{ message() }}</p>
        }
      </div>

      <ng-content />
    </div>
  `,
  host: {
    class: 'block'
  }
})
export class UiEmptyState {
  readonly icon = input<IconName>('search');
  readonly title = input.required<string>();
  readonly message = input<string>('');
}
