import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false // Make it reactive to translation state changes
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    // Access ready signal to make pipe reactive
    // When ready() changes, Angular will re-evaluate this pipe
    this.i18n.ready();
    return this.i18n.t(key, params);
  }
}





