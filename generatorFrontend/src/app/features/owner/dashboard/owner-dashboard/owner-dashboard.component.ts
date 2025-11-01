import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { API_CLIENT, ApiClient, DashboardDataset } from '../../../../core/api/api-client';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';

@Component({
  selector: 'app-owner-dashboard',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss'
})
export class OwnerDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject<ApiClient>(API_CLIENT);

  readonly data$: Observable<DashboardDataset> = from(this.api.hydrate()).pipe(
    switchMap(() => {
      const ownerId = this.auth.getOwnerIdOrThrow();
      return from(this.api.getOwnerDashboard(ownerId));
    })
  );
}
