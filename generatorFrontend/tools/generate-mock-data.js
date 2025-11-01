const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'assets', 'mocks');
fs.mkdirSync(root, { recursive: true });

const ownerId = 'owner-001';
const ownerIds = [ownerId, 'owner-002'];

const requestStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
const requests = Array.from({ length: 24 }, (_, index) => {
  const status = requestStatuses[index % requestStatuses.length];
  return {
    id: `req-${(index + 1).toString().padStart(3, '0')}`,
    applicantName: `Applicant ${index + 1}`,
    applicantEmail: `applicant${index + 1}@example.com`,
    applicantPhone: `+9617${(3000000 + index * 13).toString().slice(-7)}`,
    generatorName: `Neighborhood ${index % 6 + 1}`,
    createdAt: new Date(2025, index % 6, (index % 27) + 1).toISOString(),
    status,
    notes: status === 'REJECTED' ? 'Missing compliance document' : null,
    assignedTo: status === 'PENDING' ? 'admin-002' : 'admin-001'
  };
});

const adminPermissions = ['REQ_REVIEW', 'USER_MANAGE', 'REPORT_VIEW'];
const ownerPermissions = ['CUSTOMER_WRITE', 'BILL_WRITE', 'BILL_IMPORT', 'SMS_SEND', 'TEMPLATE_WRITE'];

const users = [
  {
    id: 'admin-001',
    name: 'Maya Saab',
    role: 'ADMIN',
    email: 'maya.saab@generator.example',
    permissions: adminPermissions,
    status: 'ACTIVE'
  },
  {
    id: 'admin-002',
    name: 'Rami Khoury',
    role: 'ADMIN',
    email: 'rami.khoury@generator.example',
    permissions: ['REQ_REVIEW', 'REPORT_VIEW'],
    status: 'ACTIVE'
  },
  {
    id: 'admin-003',
    name: 'Sara Fares',
    role: 'ADMIN',
    email: 'sara.fares@generator.example',
    permissions: ['USER_MANAGE'],
    status: 'INACTIVE'
  },
  {
    id: 'owner-001',
    name: 'Karim Haddad',
    role: 'GENERATOR_OWNER',
    ownerId,
    email: 'karim@generator.example',
    permissions: ownerPermissions,
    status: 'ACTIVE'
  },
  {
    id: 'owner-002',
    name: 'Layla Itani',
    role: 'GENERATOR_OWNER',
    ownerId: 'owner-002',
    email: 'layla@generator.example',
    permissions: ['CUSTOMER_WRITE', 'BILL_WRITE', 'SMS_SEND'],
    status: 'ACTIVE'
  }
];

const customerStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];

const ownerCustomers = Array.from({ length: 36 }, (_, index) => {
  const assignedOwner = ownerIds[index % ownerIds.length];
  return {
    id: `cust-${(index + 1).toString().padStart(3, '0')}`,
    ownerId: assignedOwner,
    fullName: `Customer ${index + 1}`,
    phoneNumber: `+96170${(100000 + index * 27).toString().padStart(6, '0').slice(-6)}`,
    subscriptionNumber: `SUB${(1200 + index).toString()}`,
    address: `Beirut District ${index % 5 + 1}, Building ${(index % 10) + 2}`,
    status: customerStatuses[index % customerStatuses.length],
    createdAt: new Date(2024, (index * 3) % 12, (index % 28) + 1).toISOString()
  };
});

const periods = ['2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'];
const billStatuses = ['PAID', 'PENDING', 'OVERDUE'];
let billCounter = 0;

const bills = ownerCustomers.flatMap((customer, customerIndex) => {
  return periods.map((period, periodIndex) => {
    const consumption = 180 + (customerIndex * 5 + periodIndex * 7) % 180;
    const rate = 0.28;
    const fixed = 15 + ((customerIndex + periodIndex) % 3) * 5;
    const usdAmount = parseFloat((consumption * rate + fixed).toFixed(2));
    const lbpAmount = Math.round(usdAmount * 89500);
    const status = periodIndex < 3 ? 'PAID' : billStatuses[(customerIndex + periodIndex) % billStatuses.length];
    billCounter += 1;
    return {
      id: `bill-${billCounter.toString().padStart(4, '0')}`,
      ownerId: customer.ownerId,
      customerId: customer.id,
      period,
      nameOnBill: customer.fullName,
      totalAmount: usdAmount,
      amountUSD: usdAmount,
      amountLBP: lbpAmount,
      dueDate: new Date(2025, periodIndex, Math.min(25, (customerIndex % 20) + 5)).toISOString(),
      issuedAt: new Date(2025, periodIndex, Math.min(12, (customerIndex % 10) + 1)).toISOString(),
      status,
      meterReadingKwh: consumption,
      billingMode: consumption % 2 === 0 ? 'METER' : 'FIXED',
      notes: periodIndex === periods.length - 1 ? 'Cycle auto-generated' : undefined
    };
  });
});

const smsTemplates = [
  {
    id: 'tmpl-reminder',
    ownerId,
    name: 'Payment reminder',
    body: 'Dear {{name}}, your bill for {{period}} is {{amount}} USD. Please settle before {{dueDate}}.',
    updatedAt: new Date(2025, 1, 15).toISOString()
  },
  {
    id: 'tmpl-welcome',
    ownerId,
    name: 'Welcome message',
    body: 'Welcome to our generator service! Contact us at 01-123456 for support.',
    updatedAt: new Date(2025, 0, 12).toISOString()
  },
  {
    id: 'tmpl-outage',
    ownerId,
    name: 'Maintenance notice',
    body: 'Scheduled maintenance on {{date}} between {{start}} and {{end}}. Thank you for your patience.',
    updatedAt: new Date(2025, 2, 8).toISOString()
  }
];

const campaigns = ['Winter Bills', 'March Reminders', 'Spring Offers'];
const smsCampaigns = campaigns.map((title, index) => {
  const statuses = ['DRAFT', 'SCHEDULED', 'SENT'];
  return {
    id: `cmp-${(index + 1).toString().padStart(3, '0')}`,
    ownerId,
    templateId: smsTemplates[index % smsTemplates.length].id,
    title,
    scheduledAt: new Date(2025, index + 1, 5).toISOString(),
    createdAt: new Date(2025, index + 1, 2).toISOString(),
    status: statuses[index % statuses.length],
    targetSegments: ['ALL_CUSTOMERS'],
    metrics: {
      delivered: 45 + index * 10,
      failed: 2 + index,
      pending: 8 - index * 2
    }
  };
});

const smsMessages = smsCampaigns.flatMap((campaign, index) => {
  return ownerCustomers.slice(index * 10, index * 10 + 40).map((customer, idx) => ({
    id: `${campaign.id}-msg-${idx + 1}`,
    campaignId: campaign.id,
    ownerId,
    recipient: customer.phoneNumber,
    status: idx % 12 === 0 ? 'FAILED' : idx % 5 === 0 ? 'PENDING' : 'DELIVERED',
    sentAt: new Date(2025, index + 1, (idx % 20) + 1, 9, idx % 60).toISOString()
  }));
});

const importBatches = Array.from({ length: 4 }, (_, idx) => ({
  id: `import-${(idx + 1).toString().padStart(3, '0')}`,
  ownerId,
  filename: `bills-${2025}-${idx + 1}.csv`,
  status: idx % 3 === 0 ? 'FAILED' : 'COMPLETED',
  totalRows: 50 + idx * 12,
  processedRows: 50 + idx * 12 - (idx % 3 === 0 ? 8 : 0),
  errorCount: idx % 3 === 0 ? 8 : 0,
  createdAt: new Date(2025, idx, 3).toISOString()
}));

const importBatchRows = importBatches.flatMap((batch, idx) =>
  Array.from({ length: 12 }, (_, rowIdx) => ({
    id: `${batch.id}-row-${rowIdx + 1}`,
    batchId: batch.id,
    ownerId,
    subscriptionNumber: `SUB${1300 + idx * 12 + rowIdx}`,
    status: rowIdx % 5 === 0 ? 'ERROR' : 'IMPORTED',
    message: rowIdx % 5 === 0 ? 'Missing meter reading' : null
  }))
);

const state = {
  generatedAt: new Date().toISOString(),
  requests,
  users,
  ownerCustomers,
  bills,
  smsTemplates,
  smsCampaigns,
  smsMessages,
  importBatches,
  importBatchRows
};

fs.writeFileSync(path.join(root, 'mock-state.json'), JSON.stringify(state, null, 2));





