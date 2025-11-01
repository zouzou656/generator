import { createSelector } from '@ngrx/store';
import { BillRecord } from '../../core/models/domain.models';
import { billsFeature } from './bills.reducer';

export const selectBillsByStatus = (status: BillRecord['status']) =>
  createSelector(billsFeature.selectAll, (bills) => bills.filter((bill) => bill.status === status));

