import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, ElementRef, input, model, signal, viewChild } from '@angular/core';

type Style = 'default' | 'sideColors';
type Color = 'primary' | 'red';

@Component({
  selector: 'app-toggle-content',
  imports: [CommonModule],
  templateUrl: './toggle-content.html',
  styleUrl: './toggle-content.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--custom-max-height]': 'customMaxHeight()'
  }
})
export class ToggleContent {
  showContent = input<boolean>(true);
  style = input<Style>('default');
  color = input<Color>('primary');
  maxHeight = input<string | null>(null);

  forceUpdateState = model<boolean>(false);

  protected show = signal<boolean>(true);
  protected customMaxHeight = signal<string>('256px');

  private readonly content = viewChild.required<ElementRef>('content');
  private readonly titleContent = viewChild.required<ElementRef>('title');

  constructor() {
    effect(() => {
      this.show.set(this.showContent());
    });

    effect(() => {
      if (this.content() && this.titleContent()) {
        this.show() ? this.calcContentHeight() : this.calcTitleHeight();
      }
    });

    effect(() => {
      if (this.forceUpdateState()) {
        if (this.maxHeight()) {
          this.customMaxHeight.set(this.maxHeight()!);
        } else {
          this.calcContentHeight();
        }

        this.forceUpdateState.set(false);
      }
    });
  }

  private calcContentHeight(): void {
    const contentHeight = this.content().nativeElement.scrollHeight;
    this.customMaxHeight.set(`${contentHeight}px`);
  }

  private calcTitleHeight(): void {
    const titleHeight = this.titleContent().nativeElement.clientHeight + (16 * 2) + 2;
    this.customMaxHeight.set(`${titleHeight}px`);
  }
}
