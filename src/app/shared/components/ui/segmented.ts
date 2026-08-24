import { Component, input, output } from '@angular/core';

export interface SegmentedOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Selector segmentado de píldoras con desplazamiento horizontal.
 * Ideal para elegir equipo o tipo de asistencia con el pulgar en móvil.
 */
@Component({
  selector: 'app-ui-segmented',
  template: `
    <div
      class="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 py-0.5"
      role="tablist"
    >
      @for (option of options(); track option.value) {
        <button
          type="button"
          role="tab"
          class="snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
          [class]="optionClass(option)"
          [disabled]="option.disabled"
          [attr.aria-selected]="isSelected(option.value)"
          (click)="select(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  host: {
    class: 'block min-w-0'
  }
})
export class UiSegmented<T = string | number> {
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly value = input<T | null>(null);

  readonly valueChange = output<T>();

  protected isSelected(candidate: T): boolean {
    return this.value() === candidate;
  }

  protected optionClass(option: SegmentedOption<T>): string {
    const selected = this.isSelected(option.value);
    if (selected) return 'bg-primary-600 text-white shadow-btn-primary';
    if (option.disabled) return 'bg-white text-slate-300 border border-line cursor-not-allowed';
    return 'bg-white text-slate-600 border border-line hover:border-primary-300 hover:text-primary-700 shadow-card';
  }

  protected select(value: T): void {
    if (!this.isSelected(value)) {
      this.valueChange.emit(value);
    }
  }
}
