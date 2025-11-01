import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { BillRecord } from '../../core/models/domain.models';
import { BillsActions } from './bills.actions';

export interface BillsState extends EntityState<BillRecord> {
  loading: boolean;
  loaded: boolean;
  ownerId: string | null;
  error: unknown | null;
}

export const billsAdapter = createEntityAdapter<BillRecord>({
  selectId: (bill) => bill.id
});

const initialState: BillsState = billsAdapter.getInitialState({
  loading: false,
  loaded: false,
  ownerId: null,
  error: null
});

export const billsFeature = createFeature({
  name: 'bills',
  reducer: createReducer(
    initialState,
    on(BillsActions.loadBills, (state, { ownerId }) => ({
      ...state,
      loading: true,
      ownerId,
      error: null
    })),
    on(BillsActions.loadBillsSuccess, (state, { bills }) =>
      billsAdapter.setAll(bills, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(BillsActions.loadBillsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error: error
    })),
    on(BillsActions.createBill, (state) => ({
      ...state,
      loading: true
    })),
    on(BillsActions.createBillSuccess, (state, { bill }) =>
      billsAdapter.upsertOne(bill, {
        ...state,
        loading: false
      })
    )
  ),
  extraSelectors: ({ selectBillsState }) => ({
    selectAll: billsAdapter.getSelectors(selectBillsState).selectAll
  })
});

export const {
  name: billsFeatureKey,
  reducer: billsReducer,
  selectAll: selectAllBills,
  selectBillsState
} = billsFeature;

