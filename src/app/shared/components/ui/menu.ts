import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { UiIcon, IconName } from './icon';

export interface UiMenuItem {
  id: string;
  label: string;
  icon: IconName;
  danger?: boolean;
}

/**
 * Menú contextual de acciones (overflow ⋯).
 * Se cierra al clickar fuera, con Escape o al seleccionar una opción.
 */
@Component({
  selector: 'app-ui-menu',
  imports: [UiIcon],
  template: `
    <button
      type="button"
      class="icon-btn size-8 sm:size-10"
      aria-haspopup="menu"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="label()"
      (click)="toggle()"
    >
      <app-ui-icon name="more-vertical" [size]="17" />
    </button>

    @if (open()) {
      <div
        class="card absolute right-0 top-full z-20 mt-1 flex min-w-44 flex-col p-1 shadow-float"
        role="menu"
      >
        @for (item of items(); track item.id) {
          <button
            type="button"
            role="menuitem"
            class="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
            [class.text-slate-700]="!item.danger"
            [class.hover:bg-canvas]="!item.danger"
            [class.text-negative]="item.danger"
            [class.hover:bg-negative-soft]="item.danger"
            (click)="choose(item)"
          >
            <app-ui-icon [name]="item.icon" [size]="16" />
            {{ item.label }}
          </button>
        }
      </div>
    }
  `,
  host: {
    class: 'relative inline-flex shrink-0',
    '(document:click)': 'checkClick($event)',
    '(document:keydown.escape)': 'open.set(false)'
  }
})
export class UiMenu {
  readonly items = input.required<UiMenuItem[]>();
  readonly label = input<string>('Acciones');

  readonly select = output<UiMenuItem>();

  private readonly elementRef = inject(ElementRef);

  protected open = signal(false);

  protected toggle(): void {
    this.open.set(!this.open());
  }

  protected choose(item: UiMenuItem): void {
    this.open.set(false);
    this.select.emit(item);
  }

  protected checkClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}
