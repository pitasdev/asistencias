import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type ButtonWidth = 'full' | 'lg' | 'md' | 'sm' | 'xs';
export type ButtonColor = 'primary' | 'red' | 'cancel';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Button {
  text = input.required<string>();
  width = input<ButtonWidth>('md');
  color = input<ButtonColor>('primary');
}
