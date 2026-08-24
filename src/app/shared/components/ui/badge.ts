import { Component, computed, input } from '@angular/core';
import { UiIcon, IconName } from './icon';

export type BadgeTone = 'neutral' | 'positive' | 'negative' | 'caution' | 'info' | 'primary';

/** Chip de estado (asistencia, rol, temporada…). */
@Component({
  selector: 'app-ui-badge',
  imports: [UiIcon],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      [class]="toneClass()"
    >
      @if (icon()) {
        <app-ui-icon [name]="icon()!" [size]="13" />
      }
      <ng-content />
    </span>
  `,
  host: {
    class: 'inline-flex'
  }
})
export class UiBadge {
  readonly tone = input<BadgeTone>('neutral');
  readonly icon = input<IconName | null>(null);

  protected readonly toneClass = computed(() => {
    switch (this.tone()) {
      case 'positive': return 'bg-positive-soft text-positive border border-positive-border/60';
      case 'negative': return 'bg-negative-soft text-negative border border-negative-border/60';
      case 'caution': return 'bg-caution-soft text-caution border border-caution-border/60';
      case 'info': return 'bg-info-soft text-info border border-info-border/60';
      case 'primary': return 'bg-primary-50 text-primary-700 border border-primary-100';
      default: return 'bg-slate-100 text-slate-600 border border-line';
    }
  });
}
