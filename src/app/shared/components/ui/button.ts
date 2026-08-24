import { Component, computed, input } from '@angular/core';
import { UiIcon, IconName } from './icon';

export type ButtonColor = 'primary' | 'red' | 'cancel' | 'tonal' | 'ghost';
type ButtonWidth = 'full' | 'lg' | 'md' | 'sm' | 'xs';

@Component({
  selector: 'app-button',
  imports: [UiIcon],
  template: `
    <button [attr.type]="type()" [class]="classes()" [disabled]="disabled() || loading()">
      @if (loading()) {
        <span class="size-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
      } @else if (icon()) {
        <app-ui-icon [name]="icon()!" [size]="18" />
      }

      {{ text() }}
    </button>
  `,
  host: {
    class: 'inline-flex'
  }
})
export class Button {
  text = input.required<string>();
  type = input<string>('button');
  width = input<ButtonWidth>('md');
  color = input<ButtonColor>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  icon = input<IconName | null>(null);

  protected readonly classes = computed(() => {
    const base = [
      'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.01em]',
      'transition-all duration-150 active:scale-[0.98] select-none whitespace-nowrap',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
      this.widthClass(),
      this.disabled() || this.loading() ? 'pointer-events-none opacity-50' : ''
    ];

    switch (this.color()) {
      case 'primary':
        base.push('h-11 px-5 bg-primary-600 text-white shadow-btn-primary hover:bg-primary-700');
        break;
      case 'red':
        base.push('h-11 px-5 bg-negative text-white shadow-btn-danger hover:bg-red-700');
        break;
      case 'tonal':
        base.push('h-11 px-5 bg-negative-soft text-negative border border-negative-border/60 hover:bg-red-100');
        break;
      case 'cancel':
        base.push('h-11 px-5 bg-slate-100 text-slate-600 hover:bg-slate-200');
        break;
      case 'ghost':
        base.push('h-11 px-4 text-primary-600 hover:bg-primary-50');
        break;
    }

    return base.join(' ');
  });

  private widthClass(): string {
    switch (this.width()) {
      case 'full': return 'w-full h-12 text-[15px]';
      case 'lg': return 'w-56';
      case 'md': return 'w-48';
      case 'sm': return 'min-w-36 px-4 h-10 text-sm';
      case 'xs': return 'min-w-28 px-3.5 h-10 text-sm';
    }
  }
}
