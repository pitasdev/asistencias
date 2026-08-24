import { Component, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-switch',
  template: `
    <button
      type="button"
      role="switch"
      class="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      [class.bg-primary-600]="isChecked()"
      [class.bg-slate-300]="!isChecked()"
      [attr.aria-checked]="isChecked()"
      (click)="onChange()"
    >
      <span
        class="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-knob transition-transform duration-200 ease-out"
        [class.translate-x-5]="isChecked()"
      ></span>
    </button>
  `,
  host: {
    class: 'inline-flex'
  }
})
export class Switch {
  readonly value = input.required<boolean>();
  readonly valueChange = output<boolean>();

  protected isChecked = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.isChecked.set(this.value());
    });
  }

  protected onChange() {
    this.isChecked.set(!this.isChecked());
    this.valueChange.emit(this.isChecked());
  }
}
