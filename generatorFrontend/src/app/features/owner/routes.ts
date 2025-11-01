import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { dirtyStateGuard } from '../../core/guards/dirty-state.guard';
import { OwnerDashboardComponent } from './dashboard/owner-dashboard/owner-dashboard.component';
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { BillsListComponent } from './bills/bills-list/bills-list.component';
import { BillCreateFormComponent } from './bills/bill-create-form/bill-create-form.component';
import { BillsImportComponent } from './imports/bills-import/bills-import.component';
import { SmsTemplatesComponent } from './sms/templates/sms-templates/sms-templates.component';
import { SmsCampaignsComponent } from './sms/campaigns/sms-campaigns/sms-campaigns.component';
import { SmsCampaignDetailComponent } from './sms/campaigns/sms-campaign-detail/sms-campaign-detail.component';
import { OwnerReportsComponent } from './reports/owner-reports/owner-reports.component';

export const OWNER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: OwnerDashboardComponent,
    data: { title: 'Dashboard' }
  },
  {
    path: 'customers',
    component: CustomersListComponent,
    canActivate: [permissionGuard],
    data: { perms: ['CUSTOMER_WRITE'], title: 'Customers' }
  },
  {
    path: 'customers/new',
    component: CustomersListComponent,
    canActivate: [permissionGuard],
    data: { perms: ['CUSTOMER_WRITE'], openDialog: true }
  },
  {
    path: 'customers/:ownerCustomerId',
    component: CustomersListComponent,
    canActivate: [permissionGuard],
    data: { perms: ['CUSTOMER_WRITE'], openDialog: true }
  },
  {
    path: 'bills',
    component: BillsListComponent,
    canActivate: [permissionGuard],
    data: { perms: ['BILL_WRITE'], title: 'Bills' }
  },
  {
    path: 'bills/new',
    component: BillCreateFormComponent,
    canActivate: [permissionGuard],
    canDeactivate: [dirtyStateGuard],
    data: { perms: ['BILL_WRITE'], title: 'New bill' }
  },
  {
    path: 'bills/import',
    component: BillsImportComponent,
    canActivate: [permissionGuard],
    data: { perms: ['BILL_IMPORT'], title: 'Import bills' }
  },
  {
    path: 'sms/templates',
    component: SmsTemplatesComponent,
    canActivate: [permissionGuard],
    data: { perms: ['TEMPLATE_WRITE'], title: 'SMS templates' }
  },
  {
    path: 'sms/campaigns',
    component: SmsCampaignsComponent,
    canActivate: [permissionGuard],
    data: { perms: ['SMS_SEND'], title: 'SMS campaigns' }
  },
  {
    path: 'sms/campaigns/:id',
    component: SmsCampaignDetailComponent,
    canActivate: [permissionGuard],
    data: { perms: ['SMS_SEND'], title: 'Campaign detail' }
  },
  {
    path: 'imports',
    component: BillsImportComponent,
    canActivate: [permissionGuard],
    data: { perms: ['BILL_IMPORT'], title: 'Imports' }
  },
  {
    path: 'reports',
    component: OwnerReportsComponent,
    canActivate: [permissionGuard],
    data: { perms: ['REPORT_VIEW'], title: 'Reports' }
  }
];

