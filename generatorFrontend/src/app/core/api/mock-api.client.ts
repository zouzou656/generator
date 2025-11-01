import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, Signal, computed, inject, WritableSignal, signal, PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  API_CLIENT,
  ApiClient,
  BillCreatePayload,
  BillImportRow,
  CustomerImportRow,
  CustomerUniqueCheck,
  CustomerUpsertPayload,
  LoginPayload,
  LoginResponse,
  RequestMutation,
  SmsCampaignUpsertPayload,
  SmsTemplateUpsertPayload
} from './api-client';
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

interface PersistedState extends ApiStateBundle {
  generatedAt: string;
}

const STORAGE_KEY = 'generator:mock-state:v1';
const TOKEN_KEY = 'generator:session-token:v1';

@Injectable({ providedIn: 'root' })
export class MockApiClient implements ApiClient {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly state: WritableSignal<ApiStateBundle | null> = signal<ApiStateBundle | null>(null);
  private readonly latency = environment.mockLatencyMs ?? 300;
  private readonly errorRate = environment.mockErrorRate ?? 0.05;

  readonly permissionsLookup: Record<UserRole, Permission[]> = {
    ADMIN: ['REQ_REVIEW', 'USER_MANAGE', 'REPORT_VIEW'],
    GENERATOR_OWNER: ['CUSTOMER_WRITE', 'BILL_WRITE', 'BILL_IMPORT', 'SMS_SEND', 'TEMPLATE_WRITE']
  };

  private persist(state: ApiStateBundle): void {
    if (!this.isBrowser) {
      return;
    }
    const payload: PersistedState = {
      ...state,
      generatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  private async ensureState(): Promise<ApiStateBundle> {
    const current = this.state();
    if (current) {
      return current;
    }

    if (this.isBrowser) {
      const persisted = localStorage.getItem(STORAGE_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted) as PersistedState;
        this.state.set(parsed);
        return parsed;
      }
    }

    const fetched = await firstValueFrom(
      this.http.get<ApiStateBundle>('assets/mocks/mock-state.json')
    );
    this.state.set(fetched);
    this.persist(fetched);
    return fetched;
  }

  private async simulateLatency<T>(producer: () => T): Promise<T> {
    await this.ensureState();
    const shouldError = Math.random() < this.errorRate;
    await new Promise((resolve) => setTimeout(resolve, this.latency + Math.random() * 120));
    if (shouldError) {
      throw new Error('Mock network error, please retry.');
    }
    const result = producer();
    if (!result) {
      return result;
    }
    return JSON.parse(JSON.stringify(result));
  }

  async hydrate(): Promise<ApiStateBundle> {
    return this.ensureState();
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const data = await this.simulateLatency(() => this.state());
    if (!data) {
      throw new Error('Mock data not initialised');
    }

    const account = data.users.find((u) => u.email === payload.email && u.role === payload.role);

    if (!account) {
      throw new Error('Invalid credentials');
    }

    const token = btoa(`${account.id}:${payload.role}:${Date.now()}`);
    const exp = Date.now() + 1000 * 60 * environment.idle.logoutMinutes;

    const session: AuthSession = {
      token,
      exp,
      role: account.role,
      permissions: account.permissions ?? this.permissionsLookup[account.role],
      userId: account.id,
      email: account.email ?? '',
      ownerId: account.ownerId,
      name: account.name ?? account.fullName ?? account.username ?? ''
    };

    if (this.isBrowser) {
      localStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({ session, createdAt: new Date().toISOString() })
      );
    }

    return { session, account };
  }

  async logout(): Promise<void> {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private mutate(updater: (draft: ApiStateBundle) => void): ApiStateBundle {
    const current = structuredClone(this.state());
    if (!current) {
      throw new Error('Mock state not initialised');
    }
    updater(current);
    this.state.set(current);
    this.persist(current);
    return current;
  }

  async getRequests(): Promise<RequestRecord[]> {
    return this.simulateLatency(() => this.state()?.requests ?? []);
  }

  async getRequest(id: string): Promise<RequestRecord | undefined> {
    return this.simulateLatency(() => this.state()?.requests.find((r) => r.id === id));
  }

  async updateRequest(id: string, mutation: RequestMutation): Promise<RequestRecord> {
    const next = this.mutate((draft) => {
      draft.requests = draft.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: mutation.status,
              notes: mutation.notes ?? req.notes,
              updatedAt: new Date().toISOString()
            }
          : req
      );
    });
    const updated = next.requests.find((req) => req.id === id);
    if (!updated) {
      throw new Error('Request not found');
    }
    return this.simulateLatency(() => updated);
  }

  async getUsers(): Promise<UserAccount[]> {
    return this.simulateLatency(() => this.state()?.users ?? []);
  }

  async getOwnerDashboard(ownerId: string): Promise<DashboardDataset> {
    const data = await this.ensureState();
    return this.simulateLatency(() => {
      const customers = data.ownerCustomers.filter((c) => c.ownerId === ownerId);
      const bills = data.bills.filter((b) => b.ownerId === ownerId);
      const smsMessages = data.smsMessages.filter((m) => m.ownerId === ownerId);

      const kpis = {
        customers: customers.length,
        activeSubscriptions: customers.filter((c) => c.status === 'ACTIVE').length,
        pendingBills: bills.filter((b) => b.status !== 'PAID').length,
        smsSent: smsMessages.filter((m) => m.status === 'DELIVERED').length
      };

      const billedSeriesMap = new Map<string, number>();
      bills.forEach((bill) => {
        const period = bill.period ?? (bill.periodYear && bill.periodMonth ? `${bill.periodYear}-${String(bill.periodMonth).padStart(2, '0')}` : 'unknown');
        const amount = billedSeriesMap.get(period) ?? 0;
        billedSeriesMap.set(period, parseFloat((amount + (bill.totalAmount || 0)).toFixed(2)));
      });

      const billedSeries = [...billedSeriesMap.entries()]
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([month, total]) => ({ month, total }));

      return { kpis, billedSeries } satisfies DashboardDataset;
    });
  }

  async getOwnerCustomers(ownerId: string): Promise<OwnerCustomer[]> {
    return this.simulateLatency(() =>
      (this.state()?.ownerCustomers ?? []).filter((c) => c.ownerId === ownerId)
    );
  }

  async upsertOwnerCustomer(
    ownerId: string,
    payload: CustomerUpsertPayload
  ): Promise<OwnerCustomer> {
    let created: OwnerCustomer | undefined;
    const next = this.mutate((draft) => {
      if (payload.id) {
        draft.ownerCustomers = draft.ownerCustomers.map((customer) =>
          customer.id === payload.id
            ? {
                ...customer,
                ...payload,
                ownerId,
                updatedAt: new Date().toISOString()
              }
            : customer
        );
        created = draft.ownerCustomers.find((customer) => customer.id === payload.id);
        return;
      }

      const id = `cust-${(draft.ownerCustomers.length + 1).toString().padStart(3, '0')}`;
      const customerId = `c-${id}`;
      const customer: OwnerCustomer = {
        id,
        generatorOwnerId: ownerId,
        ownerId, // Legacy alias
        customerId,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        subscriptionNumber: payload.subscriptionNumber,
        address: payload.address,
        status: payload.status,
        billingMode: payload.billingMode ?? 'FIXED',
        isActive: payload.status !== 'INACTIVE',
        createdAt: new Date().toISOString()
      };
      created = customer;
      draft.ownerCustomers = [customer, ...draft.ownerCustomers];
    });

    if (!created) {
      throw new Error('Unable to upsert customer');
    }

    return this.simulateLatency(() => created!);
  }

  async checkCustomerUnique(ownerId: string, payload: CustomerUniqueCheck): Promise<boolean> {
    return this.simulateLatency(() => {
      const customers = this.state()?.ownerCustomers ?? [];
      return !customers.some(
        (customer) =>
          customer.ownerId === ownerId &&
          ((payload.phoneNumber && customer.phoneNumber === payload.phoneNumber) ||
            (payload.subscriptionNumber &&
              customer.subscriptionNumber === payload.subscriptionNumber))
      );
    });
  }

  async importCustomers(ownerId: string, rows: CustomerImportRow[]): Promise<ImportBatchRecord> {
    const batch: ImportBatchRecord = {
      id: `import-cust-${(Date.now() % 100000).toString().padStart(3, '0')}`,
      generatorOwnerId: ownerId,
      ownerId, // Legacy alias
      importType: 'CUSTOMER',
      originalFilename: `customers-${new Date().toISOString()}.csv`,
      filename: `customers-${new Date().toISOString()}.csv`, // Legacy alias
      status: 'COMPLETED',
      totalRows: rows.length,
      processedRows: rows.length,
      errorCount: 0,
      createdAt: new Date().toISOString(),
      createdByUserId: 'system'
    };

    // Import customers (simplified - in real app would create Customer records first)
    this.mutate((draft) => {
      rows.forEach((row) => {
        const id = `cust-${(draft.ownerCustomers.length + 1).toString().padStart(3, '0')}`;
        const customerId = `c-${id}`;
        const customer: OwnerCustomer = {
          id,
          generatorOwnerId: ownerId,
          ownerId, // Legacy
          customerId,
          phoneNumber: row.phoneNumber,
          firstName: row.firstName,
          lastName: row.lastName,
          fullName: `${row.firstName || ''} ${row.lastName || ''}`.trim() || undefined,
          subscriptionNumber: row.subscriptionNumber,
          zone: row.zone,
          address: row.address,
          subscriptionAmps: row.subscriptionAmps,
          billingMode: row.billingMode ?? 'FIXED',
          defaultNameOnBill: row.defaultNameOnBill,
          isActive: row.isActive ?? true,
          status: row.isActive ?? true ? 'ACTIVE' : 'INACTIVE',
          createdAt: new Date().toISOString()
        };
        draft.ownerCustomers.push(customer);
      });
      
      draft.importBatches = [batch, ...draft.importBatches];
      draft.importBatchRows = [
        ...rows.map((row, idx) => ({
          id: `${batch.id}-row-${idx}`,
          importBatchId: batch.id,
          batchId: batch.id,
          rowNumber: idx + 1,
          rawDataJson: JSON.stringify(row),
          subscriptionNumber: row.subscriptionNumber,
          status: 'IMPORTED' as const,
          message: null
        })),
        ...draft.importBatchRows
      ];
    });

    return this.simulateLatency(() => batch);
  }

  async getBills(ownerId: string): Promise<BillRecord[]> {
    return this.simulateLatency(() =>
      (this.state()?.bills ?? []).filter((bill) => bill.ownerId === ownerId)
    );
  }

  async updateBill(ownerId: string, billId: string, payload: Partial<BillCreatePayload>): Promise<BillRecord> {
    let updated: BillRecord | undefined;
    this.mutate((draft) => {
      draft.bills = draft.bills.map((bill) => {
        if (bill.id !== billId || bill.ownerId !== ownerId) {
          return bill;
        }
        updated = { ...bill, ...payload };
        return updated;
      });
    });
    
    if (!updated) {
      throw new Error('Bill not found');
    }
    return this.simulateLatency(() => updated!);
  }

  async createBill(ownerId: string, payload: BillCreatePayload): Promise<BillRecord> {
    const customers = await this.getOwnerCustomers(ownerId);
    const customerId = payload.ownerCustomerId ?? payload.customerId;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const amount = payload.totalAmount ?? payload.amountUSD ?? this.calculateBillAmount(payload, customer);
    const period = payload.period ?? (payload.periodYear && payload.periodMonth ? `${payload.periodYear}-${String(payload.periodMonth).padStart(2, '0')}` : undefined);
    
    const bill: BillRecord = {
      id: `bill-${(Math.random() * 100000).toFixed(0)}`,
      generatorOwnerId: ownerId,
      ownerId, // Legacy alias
      ownerCustomerId: customer.id,
      customerId: customer.id, // Legacy alias
      billDate: payload.billDate ?? new Date().toISOString().split('T')[0],
      periodYear: payload.periodYear,
      periodMonth: payload.periodMonth,
      period, // Computed
      previousKva: payload.previousKva,
      currentKva: payload.currentKva,
      subscriptionFeeVar: payload.subscriptionFeeVar,
      subscriptionFeeFixed: payload.subscriptionFeeFixed ?? payload.fixedCharge,
      totalAmount: amount,
      amountUSD: payload.amountUSD ?? amount,
      amountLBP: payload.amountLBP ?? Math.round(amount * 89500),
      nameOnBill: payload.nameOnBill ?? customer.fullName,
      dueDate: payload.dueDate,
      notes: payload.notes,
      subscriptionAmps: payload.subscriptionAmps,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      issuedAt: new Date().toISOString(), // Alias
      billingMode: payload.currentKva ? 'METER' : 'FIXED',
      meterReadingKwh: payload.meterReadingKwh ?? (payload.currentKva && payload.previousKva ? payload.currentKva - payload.previousKva : undefined)
    };

    this.mutate((draft) => {
      draft.bills = [bill, ...draft.bills];
    });

    return this.simulateLatency(() => bill);
  }

  private calculateBillAmount(payload: BillCreatePayload, customer: OwnerCustomer): number {
    const meterAmount =
      (payload.meterReadingKwh ?? 0) * (payload.ratePerKwh ?? 0) + (payload.fixedCharge ?? 0);
    return parseFloat((meterAmount || 35).toFixed(2));
  }

  async importBills(ownerId: string, rows: BillImportRow[]): Promise<ImportBatchRecord> {
    const batch: ImportBatchRecord = {
      id: `import-${(Date.now() % 100000).toString().padStart(3, '0')}`,
      generatorOwnerId: ownerId,
      ownerId, // Legacy alias
      importType: 'BILL',
      originalFilename: `import-${new Date().toISOString()}.csv`,
      filename: `import-${new Date().toISOString()}.csv`, // Legacy alias
      status: 'COMPLETED',
      totalRows: rows.length,
      processedRows: rows.length,
      errorCount: 0,
      createdAt: new Date().toISOString(),
      createdByUserId: 'system' // Mock userId
    };

    this.mutate((draft) => {
      draft.importBatches = [batch, ...draft.importBatches];
      draft.importBatchRows = [
        ...rows.map((row, idx) => ({
          id: `${batch.id}-row-${idx}`,
          importBatchId: batch.id,
          batchId: batch.id, // Legacy alias
          rowNumber: idx + 1,
          rawDataJson: JSON.stringify(row),
          subscriptionNumber: row.subscriptionNumber, // Extracted
          status: 'IMPORTED' as const,
          message: null // Alias for errorMessage
        })),
        ...draft.importBatchRows
      ];
    });

    return this.simulateLatency(() => batch);
  }

  async getImportBatches(ownerId: string): Promise<ImportBatchRecord[]> {
    return this.simulateLatency(() =>
      (this.state()?.importBatches ?? []).filter((batch) => batch.ownerId === ownerId)
    );
  }

  async getImportBatchRows(batchId: string): Promise<ImportBatchRowRecord[]> {
    return this.simulateLatency(() =>
      (this.state()?.importBatchRows ?? []).filter((row) => row.batchId === batchId)
    );
  }

  async getSmsTemplates(ownerId: string): Promise<SmsTemplateRecord[]> {
    return this.simulateLatency(() =>
      (this.state()?.smsTemplates ?? []).filter((template) => template.ownerId === ownerId)
    );
  }

  async upsertSmsTemplate(
    ownerId: string,
    payload: SmsTemplateUpsertPayload
  ): Promise<SmsTemplateRecord> {
    let record: SmsTemplateRecord | undefined;
    this.mutate((draft) => {
      if (payload.id) {
        draft.smsTemplates = draft.smsTemplates.map((template) =>
          template.id === payload.id
            ? { ...template, ...payload, updatedAt: new Date().toISOString() }
            : template
        );
        record = draft.smsTemplates.find((t) => t.id === payload.id);
      } else {
        record = {
          id: `tmpl-${(Math.random() * 10000).toFixed(0)}`,
          generatorOwnerId: ownerId,
          ownerId, // Legacy alias
          name: payload.name,
          body: payload.body,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        draft.smsTemplates = [record, ...draft.smsTemplates];
      }
    });

    if (!record) {
      throw new Error('Failed to save template');
    }

    return this.simulateLatency(() => record!);
  }

  async deleteSmsTemplate(ownerId: string, templateId: string): Promise<void> {
    this.mutate((draft) => {
      draft.smsTemplates = draft.smsTemplates.filter((t) => t.id !== templateId);
    });
  }

  async getSmsCampaigns(ownerId: string): Promise<SmsCampaignRecord[]> {
    return this.simulateLatency(() =>
      (this.state()?.smsCampaigns ?? []).filter((campaign) => campaign.ownerId === ownerId)
    );
  }

  async upsertSmsCampaign(
    ownerId: string,
    payload: SmsCampaignUpsertPayload
  ): Promise<SmsCampaignRecord> {
    let record: SmsCampaignRecord | undefined;
    this.mutate((draft) => {
      if (payload.id) {
        draft.smsCampaigns = draft.smsCampaigns.map((campaign) =>
          campaign.id === payload.id
            ? {
                ...campaign,
                title: payload.title,
                templateId: payload.templateId,
                scheduledAt: payload.scheduledAt,
                targetSegments: payload.targetSegments
              }
            : campaign
        );
        record = draft.smsCampaigns.find((c) => c.id === payload.id);
      } else {
        record = {
          id: `cmp-${(Math.random() * 10000).toFixed(0)}`,
          generatorOwnerId: ownerId,
          ownerId, // Legacy alias
          title: payload.title,
          messageBody: payload.messageBody ?? '',
          relatedPeriodYear: payload.relatedPeriodYear,
          relatedPeriodMonth: payload.relatedPeriodMonth,
          createdByUserId: 'system', // Mock userId
          templateId: payload.templateId, // Legacy
          scheduledAt: payload.scheduledAt,
          createdAt: new Date().toISOString(),
          status: 'SCHEDULED',
          targetSegments: payload.targetSegments,
          metrics: { delivered: 0, failed: 0, pending: 0 }
        };
        draft.smsCampaigns = [record, ...draft.smsCampaigns];
      }
    });

    if (!record) {
      throw new Error('Failed to save campaign');
    }

    return this.simulateLatency(() => record!);
  }

  async sendSmsCampaign(ownerId: string, campaignId: string): Promise<SmsCampaignRecord> {
    let record: SmsCampaignRecord | undefined;
    this.mutate((draft) => {
      draft.smsCampaigns = draft.smsCampaigns.map((campaign) => {
        if (campaign.id !== campaignId) {
          return campaign;
        }
        record = {
          ...campaign,
          ownerId,
          status: 'SENT',
          metrics: {
            delivered: (campaign.metrics?.delivered ?? 0) + 42,
            failed: campaign.metrics?.failed ?? 0,
            pending: 0
          }
        };
        return record;
      });
    });

    if (!record) {
      throw new Error('Campaign not found');
    }

    return this.simulateLatency(() => record!);
  }

  async getSmsMessages(campaignId: string): Promise<SmsMessageRecord[]> {
    return this.simulateLatency(() =>
      (this.state()?.smsMessages ?? []).filter((message) => message.campaignId === campaignId)
    );
  }

  async getBillsByPhone(phone: string, subscriptionNumber?: string): Promise<CheckBillResult> {
    const data = await this.ensureState();
    return this.simulateLatency(() => {
      const normalized = phone.replace(/\s|-/g, '');
      const customers = data.ownerCustomers.filter((c) => c.phoneNumber === normalized);
      if (!customers.length) {
        return { pending: [], paid: [] } satisfies CheckBillResult;
      }
      const customerIds = customers
        .filter((customer) =>
          subscriptionNumber ? customer.subscriptionNumber === subscriptionNumber : true
        )
        .map((customer) => customer.id);
      const bills = data.bills.filter((bill) => customerIds.includes(bill.ownerCustomerId ?? bill.customerId ?? ''));
      return {
        pending: bills.filter((bill) => bill.status !== 'PAID'),
        paid: bills.filter((bill) => bill.status === 'PAID')
      } satisfies CheckBillResult;
    });
  }
}

