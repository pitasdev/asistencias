import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "@/app/shared/components/button/button";

@Component({
  selector: 'app-find-filter',
  imports: [FormsModule, Button],
  templateUrl: './find-filter.html',
  styleUrl: './find-filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindFilter {
  searchPlaceholder = input.required<string>();
  buttonText = input.required<string>();
  
  searchTextChange = output<string>();
  buttonClick = output<void>();

  protected searchText = signal<string>('');
}
