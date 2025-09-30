import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
