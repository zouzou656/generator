import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { RequestsListComponent } from './requests/requests-list/requests-list.component';
import { RequestDetailsComponent } from './requests/request-details/request-details.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { AdminReportsComponent } from './reports/admin-reports/admin-reports.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'requests'
  },
  {
    path: 'requests',
    component: RequestsListComponent,
    canActivate: [permissionGuard],
    data: {
      perms: ['REQ_REVIEW'],
      title: 'Review Requests',
      breadcrumb: ['Admin', 'Requests']
    }
  },
  {
    path: 'requests/:id',
    component: RequestDetailsComponent,
    canActivate: [permissionGuard],
    data: {
      perms: ['REQ_REVIEW'],
      title: 'Request Details'
    }
  },
  {
    path: 'users',
    component: UsersListComponent,
    canActivate: [permissionGuard],
    data: {
      perms: ['USER_MANAGE'],
      title: 'Users'
    }
  },
  {
    path: 'reports',
    component: AdminReportsComponent,
    canActivate: [permissionGuard],
    data: {
      perms: ['REPORT_VIEW'],
      title: 'Reports'
    }
  }
];





