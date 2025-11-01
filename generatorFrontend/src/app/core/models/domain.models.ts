export type UserRole = 'ADMIN' | 'GENERATOR_OWNER';

export type Permission =
  | 'REQ_REVIEW'
  | 'USER_MANAGE'
  | 'REPORT_VIEW'
  | 'CUSTOMER_WRITE'
  | 'BILL_WRITE'
  | 'BILL_IMPORT'
  | 'SMS_SEND'
  | 'TEMPLATE_WRITE';

export interface UserAccount {
  id: string;
  username: string; // NEW from DB
  fullName?: string; // NEW from DB (was 'name')
  phoneNumber?: string; // NEW from DB
  email?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean; // Changed from status: 'ACTIVE' | 'INACTIVE'
  createdAt: string; // NEW from DB
  ownerId?: string;
  // Legacy fields for backward compatibility
  name?: string; // Alias for fullName
  status?: 'ACTIVE' | 'INACTIVE'; // Alias for isActive
}

export interface AuthSession {
  token: string;
  exp: number;
  role: UserRole;
  permissions: Permission[];
  userId: string;
  email: string;
  ownerId?: string;
  name: string;
  username?: string; // NEW
}

// Generator Owner Request (from GeneratorOwnerRequest table)
export interface GeneratorOwnerRequest {
  id: string;
  ownerName: string;
  contactPerson?: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  // Display fields
  applicantName?: string; // Alias for ownerName
  applicantEmail?: string; // Alias for email
  applicantPhone?: string; // Alias for phoneNumber
  generatorName?: string; // Alias for ownerName
  assignedTo?: string; // Alias for reviewedBy
}

// Alias for backward compatibility
export interface RequestRecord extends GeneratorOwnerRequest {}

export interface UserInvitePayload {
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

// Generator Owner (from GeneratorOwner table)
export interface GeneratorOwner {
  id: string;
  appUserId: string;
  legalName: string;
  tradeName?: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

// Customer (from Customer table - global customers)
export interface Customer {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  // Computed
  fullName?: string; // Computed from firstName + lastName
}

// Owner Customer (from OwnerCustomer table - subscription link)
export interface OwnerCustomer {
  id: string;
  generatorOwnerId: string; // Changed from ownerId
  customerId: string; // NEW - reference to Customer table
  subscriptionNumber: string;
  zone?: string; // NEW from DB
  address?: string;
  subscriptionAmps?: number; // NEW from DB (DECIMAL(10,2))
  billingMode: 'METERED' | 'FIXED'; // Changed from 'METER' to 'METERED'
  defaultNameOnBill?: string; // NEW from DB
  isActive: boolean; // Changed from status string
  createdAt: string;
  // Joined Customer data (for display)
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Computed from firstName + lastName
  // Legacy compatibility
  ownerId?: string; // Alias for generatorOwnerId
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'; // Computed from isActive
}

// Bill Record (from Bill table)
export interface BillRecord {
  id: string;
  generatorOwnerId: string; // Changed from ownerId
  ownerCustomerId: string; // Changed from customerId
  billDate: string; // DATE from DB (was issuedAt)
  periodYear?: number; // NEW from DB (SMALLINT)
  periodMonth?: number; // NEW from DB (TINYINT)
  previousKva?: number; // NEW from DB (DECIMAL(10,2))
  currentKva?: number; // NEW from DB (DECIMAL(10,2))
  subscriptionFeeVar?: number; // NEW from DB (DECIMAL(12,2))
  subscriptionFeeFixed?: number; // NEW from DB (DECIMAL(12,2))
  totalAmount: number;
  amountUSD?: number; // Made optional
  amountLBP?: number; // Made optional
  nameOnBill?: string; // Made optional
  dueDate?: string; // Made optional
  notes?: string;
  subscriptionAmps?: number; // NEW from DB
  status: 'PENDING' | 'PAID' | 'CANCELLED'; // Changed OVERDUE to CANCELLED
  createdAt: string; // NEW from DB
  // Computed/display fields
  period?: string; // Computed from periodYear + periodMonth (e.g., "2025-03")
  issuedAt?: string; // Alias for billDate or createdAt
  customerId?: string; // Legacy alias
  ownerId?: string; // Legacy alias
  meterReadingKwh?: number; // Legacy alias (computed from currentKva - previousKva)
  billingMode?: 'METER' | 'FIXED'; // Computed from billing calculation
}

// SMS Template (matches DB but simplified - templates stored separately)
export interface SmsTemplateRecord {
  id: string;
  generatorOwnerId: string; // Changed from ownerId
  name: string;
  body: string; // Changed from 'messageBody' to match usage
  updatedAt: string;
  createdAt?: string; // NEW
  // Legacy
  ownerId?: string; // Alias
}

// SMS Campaign (from SmsCampaign table)
export interface SmsCampaignRecord {
  id: string;
  generatorOwnerId: string; // Changed from ownerId
  title: string;
  messageBody: string; // NEW - actual message content (not templateId)
  relatedPeriodYear?: number; // NEW from DB
  relatedPeriodMonth?: number; // NEW from DB
  createdByUserId: string; // NEW from DB
  createdAt: string;
  // Display/computed fields
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  templateId?: string; // Legacy - if using templates
  scheduledAt?: string; // Computed/display
  targetSegments?: string[]; // Display/computed
  metrics?: {
    delivered: number;
    failed: number;
    pending: number;
  };
  // Legacy
  ownerId?: string; // Alias
}

// SMS Message (from SmsMessage table)
export interface SmsMessageRecord {
  id: string;
  smsCampaignId: string; // Changed from campaignId
  ownerCustomerId: string; // NEW from DB
  phoneNumber: string;
  providerMessageId?: string; // NEW from DB
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  errorMessage?: string; // NEW from DB
  sentAt?: string;
  deliveredAt?: string; // NEW from DB
  // Legacy
  campaignId?: string; // Alias
  recipient?: string; // Alias for phoneNumber
  ownerId?: string; // Computed from ownerCustomerId
}

// Import Batch (from ImportBatch table)
export interface ImportBatchRecord {
  id: string;
  generatorOwnerId: string; // Changed from ownerId
  importType: 'CUSTOMER' | 'BILL'; // NEW from DB
  originalFilename?: string; // Changed from filename
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'; // Updated from DB
  createdAt: string;
  createdByUserId: string; // NEW from DB
  // Computed fields
  totalRows?: number;
  processedRows?: number;
  errorCount?: number;
  filename?: string; // Legacy alias
  ownerId?: string; // Legacy alias
}

// Import Batch Row (from ImportBatchRow table)
export interface ImportBatchRowRecord {
  id: string;
  importBatchId: string; // Changed from batchId
  rowNumber: number; // NEW from DB
  rawDataJson: string; // NEW from DB (NVARCHAR(MAX))
  status: 'PENDING' | 'IMPORTED' | 'ERROR'; // Updated from DB
  errorMessage?: string; // NEW from DB
  createdRecordId?: number; // NEW from DB (BIGINT)
  // Legacy
  batchId?: string; // Alias
  subscriptionNumber?: string; // Extracted from rawDataJson
  message?: string | null; // Alias for errorMessage
  ownerId?: string; // Computed from batch
}

// Bill Payment (from BillPayment table - future feature)
export interface BillPayment {
  id: string;
  billId: string;
  paymentReference?: string;
  paymentMethod: 'ONLINE' | 'CASH' | 'OMT' | 'OTHER';
  amountPaid: number;
  currency: string; // Default 'USD'
  paidAt: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
}

export interface CheckBillResult {
  pending: BillRecord[];
  paid: BillRecord[];
}

export interface DashboardKpis {
  customers: number;
  activeSubscriptions: number;
  pendingBills: number;
  smsSent: number;
}

export interface DashboardDataset {
  kpis: DashboardKpis;
  billedSeries: Array<{ month: string; total: number }>;
}

// API State Bundle
export interface ApiStateBundle {
  requests: RequestRecord[];
  users: UserAccount[];
  generatorOwners?: GeneratorOwner[]; // NEW
  customers?: Customer[]; // NEW
  ownerCustomers: OwnerCustomer[];
  bills: BillRecord[];
  smsTemplates: SmsTemplateRecord[];
  smsCampaigns: SmsCampaignRecord[];
  smsMessages: SmsMessageRecord[];
  importBatches: ImportBatchRecord[];
  importBatchRows: ImportBatchRowRecord[];
}

