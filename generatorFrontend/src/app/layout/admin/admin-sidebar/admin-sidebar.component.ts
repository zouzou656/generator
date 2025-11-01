import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermDirective } from '../../../shared/directives/has-perm.directive';
import { AuthService } from '../../../core/auth/auth.service';
import { Permission } from '../../../core/models/domain.models';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, HasPermDirective],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  readonly links: Array<{ label: string; path: string; icon: string; perms: Permission[] }> = [
    { label: 'admin.requests.title', path: '/admin/requests', icon: '📥', perms: ['REQ_REVIEW'] },
    { label: 'admin.users.title', path: '/admin/users', icon: '👥', perms: ['USER_MANAGE'] },
    { label: 'admin.reports.title', path: '/admin/reports', icon: '📊', perms: ['REPORT_VIEW'] }
  ];
}
