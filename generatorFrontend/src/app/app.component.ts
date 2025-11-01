import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PwaService } from './core/services/pwa.service';
import { I18nService } from './core/services/i18n.service';
import { TranslatePipe } from './shared/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly pwa = inject(PwaService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18n = inject(I18nService);

  readonly offline = this.pwa.offline;
  readonly updateAvailable = this.pwa.updateAvailable;

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.updateMeta();
    });
  }

  async reloadForUpdate(): Promise<void> {
    await this.pwa.activateUpdate();
  }

  private updateMeta(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.snapshot.data ?? {};
    const titleKey = data['titleKey'] as string | undefined;
    const title = data['title'] ?? (titleKey ? this.i18n.t(titleKey) : 'Generator Platform');
    this.title.setTitle(title);

    const metaDescription = data['meta']?.description ?? 'Generator platform for billing, SMS and customer operations.';
    this.meta.updateTag({ name: 'description', content: metaDescription });
  }
}
