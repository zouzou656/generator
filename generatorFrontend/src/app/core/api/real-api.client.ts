import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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

const TOKEN_KEY = 'generator:session-token:v1';
const USER_KEY = 'generator:session-user:v1';

interface ApiResponse<T> {
  correlationId: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class RealApiClient implements ApiClient {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly permissionsLookup: Record<UserRole, Permission[]> = {
    ADMIN: ['REQ_REVIEW', 'USER_MANAGE', 'REPORT_VIEW'],
    GENERATOR_OWNER: ['CUSTOMER_WRITE', 'BILL_WRITE', 'BILL_IMPORT', 'SMS_SEND', 'TEMPLATE_WRITE']
  };

  private getAuthHeaders(): HttpHeaders {
    // Only set Content-Type header here
    // Authorization header is handled by the authInterceptor to avoid circular dependency
    // The interceptor injects AuthService separately, breaking the circular dependency
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return headers;
  }

  private setUser(user: UserAccount): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private getUser(): UserAccount | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private clearAuth(): void {
    // Clear legacy storage keys (AuthService handles session storage)
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private async request<T>(method: string, endpoint: string, body?: any): Promise<T> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}${endpoint}`;

    try {
      console.log(`[API] ${method} ${url}`, body ? { body } : '');
      let response: any;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await firstValueFrom(this.http.get<ApiResponse<T>>(url, { headers }));
          break;
        case 'POST':
          response = await firstValueFrom(this.http.post<ApiResponse<T>>(url, body, { headers }));
          break;
        case 'PUT':
          response = await firstValueFrom(this.http.put<ApiResponse<T>>(url, body, { headers }));
          break;
        case 'DELETE':
          response = await firstValueFrom(this.http.delete<ApiResponse<T>>(url, { headers }));
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      console.log(`[API] Response from ${method} ${url}:`, response);
      
      if (!response || !response.data) {
        throw new Error(`Invalid API response structure for ${endpoint}`);
      }

      return response.data;
    } catch (error: any) {
      console.error(`[API] Error [${method} ${endpoint}]:`, error);
      
      // Extract meaningful error message
      let errorMessage = 'An error occurred';
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.title) {
          errorMessage = error.error.title;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.status;
      (apiError as any).originalError = error;
      throw apiError;
    }
  }

  async hydrate(): Promise<ApiStateBundle> {
    // Real API doesn't have a hydrate endpoint - we'll build state from individual calls
    const user = this.getUser();
    if (!user) {
      return {
        requests: [],
        users: [],
        ownerCustomers: [],
        bills: [],
        smsTemplates: [],
        smsCampaigns: [],
        smsMessages: [],
        importBatches: [],
        importBatchRows: []
      };
    }

    try {
      if (user.role === 'ADMIN') {
        const [requests, users] = await Promise.all([
          this.getRequests(),
          this.getUsers()
        ]);
        
        return {
          requests,
          users,
          ownerCustomers: [],
          bills: [],
          smsTemplates: [],
          smsCampaigns: [],
          smsMessages: [],
          importBatches: [],
          importBatchRows: []
        };
      } else if (user.role === 'GENERATOR_OWNER' && user.ownerId) {
        const [ownerCustomers, bills, smsTemplates, smsCampaigns, importBatches] = await Promise.all([
          this.getOwnerCustomers(user.ownerId),
          this.getBills(user.ownerId),
          this.getSmsTemplates(user.ownerId),
          this.getSmsCampaigns(user.ownerId),
          this.getImportBatches(user.ownerId)
        ]);

        return {
          requests: [],
          users: [],
          ownerCustomers,
          bills,
          smsTemplates,
          smsCampaigns,
          smsMessages: [],
          importBatches,
          importBatchRows: []
        };
      }
    } catch (error) {
      console.error('Hydrate error:', error);
    }

    return {
      requests: [],
      users: [],
      ownerCustomers: [],
      bills: [],
      smsTemplates: [],
      smsCampaigns: [],
      smsMessages: [],
      importBatches: [],
      importBatchRows: []
    };
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    console.log('[API] Login attempt with payload:', { email: payload.email });
    
    try {
      // Backend returns ApiResponse<SignInPayload> where SignInPayload is { User, Token }
      // Backend determines role automatically from user's account
      const payloadData = await this.request<any>(
        'POST',
        '/Auth/SignIn',
        { email: payload.email, password: payload.password }
      ) as { User?: any; Token?: any; user?: any; token?: any };

      console.log('[API] Login response received:', payloadData);

      // Handle both PascalCase (from C#) and camelCase (if transformed)
      const userData = payloadData.User || payloadData.user;
      const tokenData = payloadData.Token || payloadData.token;

      console.log('[API] Login response structure:', { 
        hasUserData: !!userData, 
        hasTokenData: !!tokenData,
        tokenDataKeys: tokenData ? Object.keys(tokenData) : [],
        tokenDataType: typeof tokenData
      });

      if (!userData) {
        throw new Error('Invalid login response: user data missing');
      }

      const user: UserAccount = {
        id: userData.Id?.toString() || userData.id?.toString() || '',
        username: userData.Username || userData.username || payload.email,
        fullName: userData.FullName || userData.fullName || '',
        email: userData.Email || userData.email || payload.email,
        phoneNumber: userData.PhoneNumber || userData.phoneNumber || '',
        role: (userData.Role || userData.role) as UserRole,
        permissions: this.permissionsLookup[(userData.Role || userData.role) as UserRole] || [],
        isActive: userData.IsActive ?? userData.isActive ?? true,
        createdAt: userData.CreatedAt || userData.createdAt || new Date().toISOString(),
        ownerId: (userData.GeneratorOwnerId || userData.generatorOwnerId)?.toString()
      };

      // Try multiple ways to extract the token
      let accessToken = '';
      if (typeof tokenData === 'string') {
        accessToken = tokenData;
      } else if (tokenData) {
        accessToken = tokenData.AccessToken || tokenData.accessToken || tokenData.Token || tokenData.token || '';
      }
      
      console.log('[API] Token extraction:', { 
        tokenData,
        extractedToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'empty',
        tokenLength: accessToken.length
      });

      if (!accessToken) {
        console.error('[API] Login failed: No access token in response', { payloadData, tokenData });
        throw new Error('Login failed: No access token received from server');
      }

      const session: AuthSession = {
        token: accessToken,
        exp: 0, // Will be decoded from JWT if needed
        role: user.role,
        permissions: user.permissions,
        userId: user.id,
        email: user.email || '',
        name: user.fullName || user.username,
        username: user.username,
        ownerId: user.ownerId
      };

      // AuthService will handle storing the session via its effect
      // No need to call setToken() - session is stored by AuthService automatically
      this.setUser(user);

      console.log('[API] Login successful, session created:', { userId: user.id, role: user.role });

      return { session, account: user };
    } catch (error: any) {
      console.error('[API] Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  async getRequests(): Promise<RequestRecord[]> {
    const response = await this.request<RequestRecord[]>('GET', '/Requests');
    return response.map((r) => this.mapRequestRecord(r));
  }

  async getRequest(id: string): Promise<RequestRecord | undefined> {
    const response = await this.request<RequestRecord>('GET', `/Requests/${id}`);
    return response ? this.mapRequestRecord(response) : undefined;
  }

  async updateRequest(id: string, mutation: RequestMutation): Promise<RequestRecord> {
    const response = await this.request<RequestRecord>('PUT', `/Requests/${id}`, mutation);
    return this.mapRequestRecord(response);
  }

  async getUsers(): Promise<UserAccount[]> {
    const response = await this.request<UserAccount[]>('GET', '/Users');
    console.log('[API] getUsers - raw response:', response);
    console.log('[API] getUsers - is array?', Array.isArray(response));
    if (!Array.isArray(response)) {
      console.error('[API] getUsers - response is not an array:', response);
      return [];
    }
    const mapped = response.map((u) => this.mapUserAccount(u));
    console.log('[API] getUsers - mapped users:', mapped);
    return mapped;
  }

  async getOwnerDashboard(ownerId: string): Promise<DashboardDataset> {
    return await this.request<DashboardDataset>('GET', '/Dashboard');
  }

  async getOwnerCustomers(ownerId: string): Promise<OwnerCustomer[]> {
    const response = await this.request<OwnerCustomer[]>('GET', '/OwnerCustomers');
    return response.map((oc) => this.mapOwnerCustomer(oc));
  }

  async upsertOwnerCustomer(ownerId: string, payload: CustomerUpsertPayload): Promise<OwnerCustomer> {
    const response = await this.request<OwnerCustomer>('POST', '/OwnerCustomers', payload);
    return this.mapOwnerCustomer(response);
  }

  async checkCustomerUnique(ownerId: string, payload: CustomerUniqueCheck): Promise<boolean> {
    return await this.request<boolean>('POST', '/OwnerCustomers/CheckUnique', payload);
  }

  async importCustomers(ownerId: string, rows: CustomerImportRow[]): Promise<ImportBatchRecord> {
    // Backend extracts ownerId from JWT token
    const response = await this.request<ImportBatchRecord>('POST', '/OwnerCustomers/Import', { 
      rows,
      originalFilename: `customers-${new Date().toISOString()}.csv`
    });
    return this.mapImportBatch(response);
  }

  async getBills(ownerId: string): Promise<BillRecord[]> {
    const response = await this.request<BillRecord[]>('GET', '/Bills');
    return response.map((b) => this.mapBillRecord(b));
  }

  async createBill(ownerId: string, payload: BillCreatePayload): Promise<BillRecord> {
    const response = await this.request<BillRecord>('POST', '/Bills', payload);
    return this.mapBillRecord(response);
  }

  async updateBill(ownerId: string, billId: string, payload: Partial<BillCreatePayload>): Promise<BillRecord> {
    const response = await this.request<BillRecord>('PUT', `/Bills/${billId}`, payload);
    return this.mapBillRecord(response);
  }

  async importBills(ownerId: string, rows: BillImportRow[]): Promise<ImportBatchRecord> {
    // Backend extracts ownerId from JWT token
    const response = await this.request<ImportBatchRecord>('POST', '/Bills/Import', { 
      rows,
      originalFilename: `bills-${new Date().toISOString()}.csv`
    });
    return this.mapImportBatch(response);
  }

  async getImportBatches(ownerId: string): Promise<ImportBatchRecord[]> {
    const response = await this.request<ImportBatchRecord[]>('GET', '/ImportBatches');
    return response.map((b) => this.mapImportBatch(b));
  }

  async getImportBatchRows(batchId: string): Promise<ImportBatchRowRecord[]> {
    const response = await this.request<ImportBatchRowRecord[]>('GET', `/ImportBatches/${batchId}/Rows`);
    return response.map((r) => this.mapImportBatchRow(r));
  }

  async getSmsTemplates(ownerId: string): Promise<SmsTemplateRecord[]> {
    // Backend extracts ownerId from JWT token, so we don't pass it as a parameter
    const response = await this.request<SmsTemplateRecord[]>('GET', '/Sms/Templates');
    return response.map((t) => this.mapSmsTemplate(t));
  }

  async upsertSmsTemplate(ownerId: string, payload: SmsTemplateUpsertPayload): Promise<SmsTemplateRecord> {
    // Backend extracts ownerId from JWT token
    const response = await this.request<SmsTemplateRecord>('POST', '/Sms/Templates', payload);
    return this.mapSmsTemplate(response);
  }

  async deleteSmsTemplate(ownerId: string, templateId: string): Promise<void> {
    // Backend extracts ownerId from JWT token
    await this.request<void>('DELETE', `/Sms/Templates/${templateId}`);
  }

  async getSmsCampaigns(ownerId: string): Promise<SmsCampaignRecord[]> {
    // Backend extracts ownerId from JWT token
    const response = await this.request<SmsCampaignRecord[]>('GET', '/Sms/Campaigns');
    return response.map((c) => this.mapSmsCampaign(c));
  }

  async upsertSmsCampaign(ownerId: string, payload: SmsCampaignUpsertPayload): Promise<SmsCampaignRecord> {
    // Backend extracts ownerId from JWT token
    const response = await this.request<SmsCampaignRecord>('POST', '/Sms/Campaigns', payload);
    return this.mapSmsCampaign(response);
  }

  async sendSmsCampaign(ownerId: string, campaignId: string): Promise<SmsCampaignRecord> {
    // Backend extracts ownerId from JWT token
    const response = await this.request<SmsCampaignRecord>('POST', `/Sms/Campaigns/${campaignId}/Send`);
    return this.mapSmsCampaign(response);
  }

  async getSmsMessages(campaignId: string): Promise<SmsMessageRecord[]> {
    const response = await this.request<SmsMessageRecord[]>('GET', `/Sms/Campaigns/${campaignId}/Messages`);
    return response.map((m) => this.mapSmsMessage(m));
  }

  async getBillsByPhone(phone: string, subscriptionNumber?: string): Promise<CheckBillResult> {
    const response = await this.request<CheckBillResult>('POST', '/Portal/CheckBill', {
      phoneNumber: phone,
      subscriptionNumber
    });
    return {
      pending: response.pending.map((b) => this.mapBillRecord(b)),
      paid: response.paid.map((b) => this.mapBillRecord(b))
    };
  }

  // Mapping functions to transform API responses to frontend models
  private mapRequestRecord(r: any): RequestRecord {
    const record: RequestRecord = {
      id: (r.id || r.Id)?.toString() || '',
      ownerName: r.ownerName || r.OwnerName || '',
      contactPerson: r.contactPerson || r.ContactPerson || undefined,
      phoneNumber: r.phoneNumber || r.PhoneNumber || '',
      email: r.email || r.Email || undefined,
      address: r.address || r.Address || undefined,
      notes: r.notes || r.Notes || undefined,
      status: (r.status || r.Status) as 'PENDING' | 'APPROVED' | 'REJECTED',
      createdAt: r.createdAt || r.CreatedAt || new Date().toISOString(),
      reviewedAt: r.reviewedAt || r.ReviewedAt || undefined,
      reviewedBy: (r.reviewedBy || r.ReviewedBy)?.toString() || undefined
    };
    
    // Populate alias fields for backward compatibility
    record.applicantName = record.contactPerson || record.ownerName;
    record.applicantEmail = record.email;
    record.applicantPhone = record.phoneNumber;
    record.generatorName = record.ownerName;
    record.assignedTo = record.reviewedBy;
    
    return record;
  }

  private mapUserAccount(u: any): UserAccount {
    // Handle null/undefined generatorOwnerId properly
    const generatorOwnerId = u.generatorOwnerId ?? u.GeneratorOwnerId;
    const ownerId = generatorOwnerId != null ? generatorOwnerId.toString() : undefined;
    
    const user: UserAccount = {
      id: String(u.id ?? u.Id ?? ''),
      username: u.username || u.Username || u.email || u.Email || '',
      fullName: u.fullName || u.FullName || '',
      email: u.email || u.Email || '',
      phoneNumber: u.phoneNumber || u.PhoneNumber || '',
      role: (u.role || u.Role) as UserRole,
      permissions: this.permissionsLookup[(u.role || u.Role) as UserRole] || [],
      isActive: u.isActive ?? u.IsActive ?? true,
      createdAt: u.createdAt || u.CreatedAt || new Date().toISOString(),
      ownerId: ownerId
    };
    
    // Populate alias fields for backward compatibility
    user.name = user.fullName;
    user.status = user.isActive ? 'ACTIVE' : 'INACTIVE';
    
    console.log('[API] mapUserAccount - mapped user:', user);
    
    return user;
  }

  private mapOwnerCustomer(oc: any): OwnerCustomer {
    const customer: OwnerCustomer = {
      id: (oc.id || oc.Id)?.toString() || '',
      generatorOwnerId: (oc.generatorOwnerId || oc.GeneratorOwnerId)?.toString() || '',
      customerId: (oc.customerId || oc.CustomerId)?.toString() || '',
      subscriptionNumber: oc.subscriptionNumber || oc.SubscriptionNumber || '',
      zone: oc.zone || oc.Zone,
      address: oc.address || oc.Address,
      subscriptionAmps: oc.subscriptionAmps || oc.SubscriptionAmps,
      billingMode: (oc.billingMode || oc.BillingMode || 'METERED') as 'METERED' | 'FIXED',
      defaultNameOnBill: oc.defaultNameOnBill || oc.DefaultNameOnBill,
      isActive: oc.isActive ?? oc.IsActive ?? true,
      createdAt: oc.createdAt || oc.CreatedAt || new Date().toISOString(),
      phoneNumber: oc.phoneNumber || oc.PhoneNumber,
      firstName: oc.firstName || oc.FirstName,
      lastName: oc.lastName || oc.LastName
    };
    
    // Compute display fields
    if (customer.firstName && customer.lastName) {
      customer.fullName = `${customer.firstName} ${customer.lastName}`;
    } else if (customer.firstName) {
      customer.fullName = customer.firstName;
    } else if (customer.lastName) {
      customer.fullName = customer.lastName;
    }
    
    // Populate alias fields
    customer.ownerId = customer.generatorOwnerId;
    customer.status = customer.isActive ? 'ACTIVE' : 'INACTIVE';
    
    return customer;
  }

  private mapBillRecord(b: any): BillRecord {
    const bill: BillRecord = {
      id: (b.id || b.Id)?.toString() || '',
      generatorOwnerId: (b.generatorOwnerId || b.GeneratorOwnerId)?.toString() || '',
      ownerCustomerId: (b.ownerCustomerId || b.OwnerCustomerId)?.toString() || '',
      billDate: b.billDate || b.BillDate || new Date().toISOString(),
      periodYear: b.periodYear || b.PeriodYear,
      periodMonth: b.periodMonth || b.PeriodMonth,
      previousKva: b.previousKva || b.PreviousKva,
      currentKva: b.currentKva || b.CurrentKva,
      subscriptionFeeVar: b.subscriptionFeeVar || b.SubscriptionFeeVar,
      subscriptionFeeFixed: b.subscriptionFeeFixed || b.SubscriptionFeeFixed,
      totalAmount: b.totalAmount || b.TotalAmount || 0,
      amountUSD: b.amountUSD || b.AmountUSD,
      amountLBP: b.amountLBP || b.AmountLBP,
      nameOnBill: b.nameOnBill || b.NameOnBill,
      dueDate: b.dueDate || b.DueDate,
      notes: b.notes || b.Notes,
      subscriptionAmps: b.subscriptionAmps || b.SubscriptionAmps,
      status: (b.status || b.Status) as 'PENDING' | 'PAID' | 'CANCELLED',
      createdAt: b.createdAt || b.CreatedAt || new Date().toISOString()
    };
    
    // Compute display fields
    if (bill.periodYear && bill.periodMonth) {
      bill.period = `${bill.periodYear}-${String(bill.periodMonth).padStart(2, '0')}`;
    }
    bill.issuedAt = bill.billDate || bill.createdAt;
    bill.customerId = bill.ownerCustomerId;
    bill.ownerId = bill.generatorOwnerId;
    if (bill.currentKva && bill.previousKva) {
      bill.meterReadingKwh = bill.currentKva - bill.previousKva;
    }
    
    return bill;
  }

  private mapImportBatch(b: any): ImportBatchRecord {
    const batch: ImportBatchRecord = {
      id: (b.id || b.Id)?.toString() || '',
      generatorOwnerId: (b.generatorOwnerId || b.GeneratorOwnerId)?.toString() || '',
      importType: (b.importType || b.ImportType || 'CUSTOMER') as 'CUSTOMER' | 'BILL',
      originalFilename: b.originalFilename || b.OriginalFilename,
      status: (b.status || b.Status || 'PENDING') as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
      createdAt: b.createdAt || b.CreatedAt || new Date().toISOString(),
      createdByUserId: (b.createdByUserId || b.CreatedByUserId)?.toString() || ''
    };
    
    // Populate aliases
    batch.ownerId = batch.generatorOwnerId;
    batch.filename = batch.originalFilename;
    
    return batch;
  }

  private mapImportBatchRow(r: any): ImportBatchRowRecord {
    const row: ImportBatchRowRecord = {
      id: (r.id || r.Id)?.toString() || '',
      importBatchId: (r.importBatchId || r.ImportBatchId)?.toString() || '',
      rowNumber: r.rowNumber || r.RowNumber || 0,
      rawDataJson: r.rawDataJson || r.RawDataJson || '',
      status: (r.status || r.Status || 'PENDING') as 'PENDING' | 'IMPORTED' | 'ERROR',
      errorMessage: r.errorMessage || r.ErrorMessage,
      createdRecordId: (r.createdRecordId || r.CreatedRecordId)?.toString()
    };
    
    // Populate aliases
    row.batchId = row.importBatchId;
    row.message = row.errorMessage;
    
    return row;
  }

  private mapSmsTemplate(t: any): SmsTemplateRecord {
    const template: SmsTemplateRecord = {
      id: (t.id || t.Id)?.toString() || '',
      generatorOwnerId: (t.generatorOwnerId || t.GeneratorOwnerId)?.toString() || '',
      name: t.name || t.Name || '',
      body: t.body || t.Body || '',
      updatedAt: t.updatedAt || t.UpdatedAt || new Date().toISOString(),
      createdAt: t.createdAt || t.CreatedAt
    };
    
    // Populate alias
    template.ownerId = template.generatorOwnerId;
    
    return template;
  }

  private mapSmsCampaign(c: any): SmsCampaignRecord {
    const campaign: SmsCampaignRecord = {
      id: (c.id || c.Id)?.toString() || '',
      generatorOwnerId: (c.generatorOwnerId || c.GeneratorOwnerId)?.toString() || '',
      title: c.title || c.Title || '',
      messageBody: c.messageBody || c.MessageBody || '',
      relatedPeriodYear: c.relatedPeriodYear || c.RelatedPeriodYear,
      relatedPeriodMonth: c.relatedPeriodMonth || c.RelatedPeriodMonth,
      createdByUserId: (c.createdByUserId || c.CreatedByUserId)?.toString() || '',
      createdAt: c.createdAt || c.CreatedAt || new Date().toISOString(),
      status: 'DRAFT' // Default status - should come from API if available
    };
    
    // Populate aliases
    campaign.ownerId = campaign.generatorOwnerId;
    
    return campaign;
  }

  private mapSmsMessage(m: any): SmsMessageRecord {
    const message: SmsMessageRecord = {
      id: (m.id || m.Id)?.toString() || '',
      smsCampaignId: (m.smsCampaignId || m.SmsCampaignId)?.toString() || '',
      ownerCustomerId: (m.ownerCustomerId || m.OwnerCustomerId)?.toString() || '',
      phoneNumber: m.phoneNumber || m.PhoneNumber || '',
      providerMessageId: m.providerMessageId || m.ProviderMessageId,
      status: (m.status || m.Status || 'PENDING') as 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED',
      errorMessage: m.errorMessage || m.ErrorMessage,
      sentAt: m.sentAt || m.SentAt,
      deliveredAt: m.deliveredAt || m.DeliveredAt
    };
    
    // Populate aliases
    message.campaignId = message.smsCampaignId;
    message.recipient = message.phoneNumber;
    
    return message;
  }
}

