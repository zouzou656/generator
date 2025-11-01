import { InjectionToken } from '@angular/core';
import {
  ApiStateBundle,
  AuthSession,
  BillRecord,
  CheckBillResult,
  DashboardDataset,
  ImportBatchRecord,
  ImportBatchRowRecord,
  OwnerCustomer,
  Permission,
  RequestRecord,
  SmsCampaignRecord,
  SmsMessageRecord,
  SmsTemplateRecord,
  UserAccount,
  UserRole
} from '../models/domain.models';

// Re-export commonly used types
export type { DashboardDataset, SmsTemplateRecord };

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  session: AuthSession;
  account: UserAccount;
}

export interface RequestMutation {
  status: RequestRecord['status'];
  notes?: string | null;
}

export interface CustomerUpsertPayload {
  id?: string;
  // Customer fields (from Customer table)
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  // OwnerCustomer fields (from OwnerCustomer table)
  subscriptionNumber: string;
  zone?: string;
  address?: string;
  subscriptionAmps?: number;
  billingMode: 'METERED' | 'FIXED';
  defaultNameOnBill?: string;
  isActive?: boolean;
  // Legacy compatibility
  fullName?: string; // Will be split into firstName/lastName
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface CustomerUniqueCheck {
  phoneNumber?: string;
  subscriptionNumber?: string;
}

export interface BillCreatePayload {
  ownerCustomerId: string; // Changed from customerId
  billDate: string; // DATE format (YYYY-MM-DD)
  periodYear?: number;
  periodMonth?: number;
  previousKva?: number;
  currentKva?: number;
  subscriptionFeeVar?: number;
  subscriptionFeeFixed?: number;
  totalAmount: number;
  amountUSD?: number;
  amountLBP?: number;
  nameOnBill?: string;
  dueDate?: string; // DATE format
  notes?: string;
  subscriptionAmps?: number;
  // Legacy fields for backward compatibility
  customerId?: string; // Mapped to ownerCustomerId
  period?: string; // Parsed to periodYear/periodMonth
  meterReadingKwh?: number; // Computed from currentKva - previousKva
  ratePerKwh?: number; // Legacy
  fixedCharge?: number; // Mapped to subscriptionFeeFixed
}

export interface BillImportRow {
  subscriptionNumber: string;
  periodYear: number; // NEW - prefer year/month over period string
  periodMonth: number; // NEW
  period?: string; // Legacy - will be parsed
  totalAmount: number;
  previousKva?: number;
  currentKva?: number;
  subscriptionFeeVar?: number;
  subscriptionFeeFixed?: number;
  nameOnBill?: string;
  dueDate?: string;
  notes?: string;
  subscriptionAmps?: number;
  // Legacy
  amountUSD?: number; // Mapped to totalAmount
}

export interface CustomerImportRow {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  subscriptionNumber: string;
  zone?: string;
  address?: string;
  subscriptionAmps?: number;
  billingMode?: 'METERED' | 'FIXED';
  defaultNameOnBill?: string;
  isActive?: boolean;
}

export interface SmsTemplateUpsertPayload {
  id?: string;
  name: string;
  body: string;
}

export interface SmsCampaignUpsertPayload {
  id?: string;
  title: string;
  messageBody: string; // NEW - actual message (not templateId)
  relatedPeriodYear?: number;
  relatedPeriodMonth?: number;
  scheduledAt?: string; // Optional - for scheduling
  targetSegments: string[];
  // Legacy
  templateId?: string; // If using template, will be converted to messageBody
}

export interface ApiClient {
  readonly permissionsLookup: Record<UserRole, Permission[]>;

  hydrate(): Promise<ApiStateBundle>;

  login(payload: LoginPayload): Promise<LoginResponse>;
  logout(): Promise<void>;

  getRequests(): Promise<RequestRecord[]>;
  getRequest(id: string): Promise<RequestRecord | undefined>;
  updateRequest(id: string, mutation: RequestMutation): Promise<RequestRecord>;

  getUsers(): Promise<UserAccount[]>;

  getOwnerDashboard(ownerId: string): Promise<DashboardDataset>;

  getOwnerCustomers(ownerId: string): Promise<OwnerCustomer[]>;
  upsertOwnerCustomer(ownerId: string, payload: CustomerUpsertPayload): Promise<OwnerCustomer>;
  checkCustomerUnique(ownerId: string, payload: CustomerUniqueCheck): Promise<boolean>;
  importCustomers(ownerId: string, rows: CustomerImportRow[]): Promise<ImportBatchRecord>; // NEW

  getBills(ownerId: string): Promise<BillRecord[]>;
  createBill(ownerId: string, payload: BillCreatePayload): Promise<BillRecord>;
  updateBill(ownerId: string, billId: string, payload: Partial<BillCreatePayload>): Promise<BillRecord>; // NEW

  importBills(ownerId: string, rows: BillImportRow[]): Promise<ImportBatchRecord>;
  getImportBatches(ownerId: string): Promise<ImportBatchRecord[]>;
  getImportBatchRows(batchId: string): Promise<ImportBatchRowRecord[]>;

  getSmsTemplates(ownerId: string): Promise<SmsTemplateRecord[]>;
  upsertSmsTemplate(ownerId: string, payload: SmsTemplateUpsertPayload): Promise<SmsTemplateRecord>;
  deleteSmsTemplate(ownerId: string, templateId: string): Promise<void>; // NEW

  getSmsCampaigns(ownerId: string): Promise<SmsCampaignRecord[]>;
  upsertSmsCampaign(ownerId: string, payload: SmsCampaignUpsertPayload): Promise<SmsCampaignRecord>;
  sendSmsCampaign(ownerId: string, campaignId: string): Promise<SmsCampaignRecord>;
  getSmsMessages(campaignId: string): Promise<SmsMessageRecord[]>;

  getBillsByPhone(phone: string, subscriptionNumber?: string): Promise<CheckBillResult>;
}

export const API_CLIENT = new InjectionToken<ApiClient>('API_CLIENT');

