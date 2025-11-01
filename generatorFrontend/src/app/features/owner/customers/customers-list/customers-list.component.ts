import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { OwnerCustomersActions } from '../../../../state/owner-customers/owner-customers.actions';
import { selectOwnerCustomersForOwner } from '../../../../state/owner-customers/owner-customers.selectors';
import { OwnerCustomer } from '../../../../core/models/domain.models';
import { CustomerUpsertDialogComponent } from '../customer-upsert-dialog/customer-upsert-dialog.component';

@Component({
  selector: 'app-customers-list',
  imports: [
    CommonModule,
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    TranslatePipe
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly searchTerm = signal('');
  readonly customers$ = this.store.select(selectOwnerCustomersForOwner);

  ngOnInit(): void {
    const ownerId = this.auth.getOwnerIdOrThrow();
    this.store.dispatch(OwnerCustomersActions.loadOwnerCustomers({ ownerId }));

    if (this.route.snapshot.data['openDialog']) {
      const customerId = this.route.snapshot.paramMap.get('ownerCustomerId');
      const sub = this.customers$.subscribe((customers) => {
        const existing = customers.find((c: OwnerCustomer) => c.id === customerId);
        if (existing || !customerId) {
          this.openDialog(existing ?? null);
        }
        sub.unsubscribe();
      });
    }
  }

  openDialog(customer: OwnerCustomer | null): void {
    const dialogRef = this.dialog.open(CustomerUpsertDialogComponent, {
      width: '500px',
      data: { customer }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.store.dispatch(
        OwnerCustomersActions.upsertOwnerCustomer({
          ownerId: this.auth.getOwnerIdOrThrow(),
          payload: {
            id: result.id ?? undefined,
            fullName: result.fullName ?? '',
            phoneNumber: result.phoneNumber ?? '',
            subscriptionNumber: result.subscriptionNumber ?? '',
            address: result.address ?? '',
            status: result.status as OwnerCustomer['status'],
            billingMode: result.billingMode ?? 'FIXED'
          }
        })
      );
      this.router.navigate(['/owner/customers']);
    });
  }

  matchesSearch(customer: OwnerCustomer): boolean {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return true;
    }
    const searchFields = [
      customer.fullName,
      customer.firstName,
      customer.lastName,
      customer.phoneNumber,
      customer.subscriptionNumber,
      customer.address,
      customer.zone
    ].filter(Boolean);
    return searchFields.some((field) => field!.toLowerCase().includes(term));
  }

  getActiveCount(customers: OwnerCustomer[]): number {
    return customers.filter(c => {
      if (c.isActive !== undefined) return c.isActive;
      return c.status === 'ACTIVE';
    }).length;
  }

  getInactiveCount(customers: OwnerCustomer[]): number {
    return customers.filter(c => {
      if (c.isActive !== undefined) return !c.isActive;
      return c.status === 'INACTIVE';
    }).length;
  }

  getPendingCount(customers: OwnerCustomer[]): number {
    return customers.filter(c => c.status === 'PENDING').length;
  }

  getCustomerName(customer: OwnerCustomer): string {
    if (customer.fullName) return customer.fullName;
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return 'N/A';
  }

  getCustomerStatus(customer: OwnerCustomer): string {
    if (customer.status) return customer.status;
    return customer.isActive ? 'ACTIVE' : 'INACTIVE';
  }

  getStatusColor(status: string): string | undefined {
    const colors: Record<string, string | undefined> = {
      'ACTIVE': 'primary',
      'INACTIVE': undefined,
      'PENDING': 'accent'
    };
    return colors[status];
  }
}
