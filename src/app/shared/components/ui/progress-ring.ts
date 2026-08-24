import { Component, computed, input } from '@angular/core';

/**
 * Anillo de progreso SVG animado para estadísticas.
 * El color se calcula según el umbral: ≥80 verde, ≥50 ámbar, <50 rojo.
 */
@Component({
  selector: 'app-ui-progress-ring',
  template: `
    <div class="relative inline-flex" [style.width]="diameter() + 'px'" [style.height]="diameter() + 'px'">
      <svg [attr.width]="diameter()" [attr.height]="diameter()" viewBox="0 0 100 100" class="-rotate-90">
        <circle cx="50" cy="50" [attr.r]="radius()" fill="none" class="stroke-slate-100" [attr.stroke-width]="thickness()" />
        <circle
          cx="50"
          cy="50"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke-width]="thickness()"
          stroke-linecap="round"
          class="transition-[stroke-dashoffset] duration-700 ease-out"
          [class]="trackColorClass()"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="offset()"
        />
      </svg>

      <span class="absolute inset-0 flex items-center justify-center">
        <span
          class="font-bold tabular-nums tracking-tight"
          [class]="textColorClass() + ' ' + textSizeClass()"
        >{{ value() }}%</span>
      </span>
    </div>
  `,
  host: {
    class: 'inline-flex'
  }
})
export class UiProgressRing {
  readonly value = input.required<number>();
  readonly diameter = input<number>(88);
  readonly thickness = input<number>(9);

  private readonly radiusValue = 50 - 4.5;

  protected readonly radius = computed(() => this.radiusValue);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radiusValue);
  protected readonly offset = computed(() => {
    const clamped = Math.min(100, Math.max(0, this.value()));
    return this.circumference() * (1 - clamped / 100);
  });

  protected readonly trackColorClass = computed(() => {
    const v = this.value();
    if (v >= 80) return 'stroke-positive';
    if (v >= 50) return 'stroke-caution';
    return 'stroke-negative';
  });

  protected readonly textColorClass = computed(() => {
    const v = this.value();
    if (v >= 80) return 'text-positive';
    if (v >= 50) return 'text-caution';
    return 'text-negative';
  });

  protected readonly textSizeClass = computed(() => {
    const d = this.diameter();
    if (d >= 96) return 'text-xl';
    if (d >= 72) return 'text-lg';
    return 'text-sm';
  });
}
