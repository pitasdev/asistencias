import { Component, model } from '@angular/core';
import { UiIcon } from './icon';

/**
 * Sección plegable tipo acordeón.
 * La animación de altura usa grid-template-rows (0fr → 1fr): fluida y sin cálculos en JS.
 *
 *   <app-ui-disclosure [(expanded)]="open">
 *     <div header>Mi título</div>
 *     contenido…
 *   </app-ui-disclosure>
 */
@Component({
  selector: 'app-ui-disclosure',
  imports: [UiIcon],
  template: `
    <section class="card overflow-hidden">
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3.5 text-left md:px-5"
        (click)="toggle()"
        [attr.aria-expanded]="expanded()"
      >
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <ng-content select="[header]" />
        </div>

        <span class="text-slate-400 transition-transform duration-200" [class.rotate-180]="expanded()">
          <app-ui-icon name="chevron-down" [size]="18" />
        </span>
      </button>

      <div
        class="grid transition-[grid-template-rows] duration-300 ease-in-out"
        [style.grid-template-rows]="expanded() ? '1fr' : '0fr'"
      >
        <div class="overflow-hidden">
          <div class="px-4 pb-4 md:px-5 md:pb-5">
            <ng-content />
          </div>
        </div>
      </div>
    </section>
  `
})
export class UiDisclosure {
  readonly expanded = model<boolean>(true);

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
