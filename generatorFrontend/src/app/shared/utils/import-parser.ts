import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BillImportRow, CustomerImportRow } from '../../core/api/api-client';

function normaliseRow(row: Record<string, unknown>): BillImportRow {
  // Parse period if provided as string (e.g., "2025-03" or "March 2025")
  let periodYear: number | undefined;
  let periodMonth: number | undefined;
  const period = String(row['period'] ?? row['Period'] ?? '').trim();
  if (period) {
    // Try parsing "YYYY-MM" format
    const match = period.match(/^(\d{4})-(\d{1,2})$/);
    if (match) {
      periodYear = parseInt(match[1], 10);
      periodMonth = parseInt(match[2], 10);
    } else {
      // Try parsing periodYear and periodMonth separately
      periodYear = row['periodYear'] || row['PeriodYear'] ? Number(row['periodYear'] || row['PeriodYear']) : undefined;
      periodMonth = row['periodMonth'] || row['PeriodMonth'] ? Number(row['periodMonth'] || row['PeriodMonth']) : undefined;
    }
  } else {
    periodYear = row['periodYear'] || row['PeriodYear'] ? Number(row['periodYear'] || row['PeriodYear']) : undefined;
    periodMonth = row['periodMonth'] || row['PeriodMonth'] ? Number(row['periodMonth'] || row['PeriodMonth']) : undefined;
  }

  return {
    subscriptionNumber: String(row['subscriptionNumber'] ?? row['Subscription'] ?? '').trim(),
    periodYear: periodYear || new Date().getFullYear(),
    periodMonth: periodMonth || new Date().getMonth() + 1,
    totalAmount: Number(row['totalAmount'] ?? row['amountUSD'] ?? row['AmountUSD'] ?? 0),
    previousKva: row['previousKva'] ? Number(row['previousKva']) : undefined,
    currentKva: row['currentKva'] ? Number(row['currentKva']) : undefined,
    subscriptionFeeVar: row['subscriptionFeeVar'] ? Number(row['subscriptionFeeVar']) : undefined,
    subscriptionFeeFixed: row['subscriptionFeeFixed'] ? Number(row['subscriptionFeeFixed']) : undefined,
    nameOnBill: row['nameOnBill'] ? String(row['nameOnBill']) : undefined,
    dueDate: row['dueDate'] || row['DueDate'] ? String(row['dueDate'] || row['DueDate']).trim() : undefined,
    notes: row['notes'] ? String(row['notes']) : undefined,
    subscriptionAmps: row['subscriptionAmps'] ? Number(row['subscriptionAmps']) : undefined,
    // Legacy support
    period: period || undefined,
    amountUSD: row['amountUSD'] ? Number(row['amountUSD']) : undefined
  };
}

export async function parseImportFile(file: File): Promise<BillImportRow[]> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve((results.data as Record<string, unknown>[]).map(normaliseRow)),
        error: (error) => reject(error)
      });
    });
  }

  const arrayBuffer = await (file.arrayBuffer ? file.arrayBuffer() : new Response(file).arrayBuffer());
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return json.map(normaliseRow);
}

function normaliseCustomerRow(row: Record<string, unknown>): CustomerImportRow {
  return {
    phoneNumber: String(row['phoneNumber'] ?? row['PhoneNumber'] ?? '').trim(),
    firstName: row['firstName'] || row['FirstName'] ? String(row['firstName'] || row['FirstName']).trim() : undefined,
    lastName: row['lastName'] || row['LastName'] ? String(row['lastName'] || row['LastName']).trim() : undefined,
    subscriptionNumber: String(row['subscriptionNumber'] ?? row['SubscriptionNumber'] ?? '').trim(),
    zone: row['zone'] || row['Zone'] ? String(row['zone'] || row['Zone']).trim() : undefined,
    address: row['address'] || row['Address'] ? String(row['address'] || row['Address']).trim() : undefined,
    subscriptionAmps: row['subscriptionAmps'] || row['SubscriptionAmps'] ? Number(row['subscriptionAmps'] || row['SubscriptionAmps']) : undefined,
    billingMode: (row['billingMode'] || row['BillingMode'] ? String(row['billingMode'] || row['BillingMode']).toUpperCase() : 'FIXED') as 'METERED' | 'FIXED',
    defaultNameOnBill: row['defaultNameOnBill'] || row['DefaultNameOnBill'] ? String(row['defaultNameOnBill'] || row['DefaultNameOnBill']).trim() : undefined,
    isActive: row['isActive'] !== undefined ? (row['isActive'] === true || row['isActive'] === 'true' || String(row['isActive']).toLowerCase() === 'true') : true
  };
}

export async function parseCustomerImportFile(file: File): Promise<CustomerImportRow[]> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve((results.data as Record<string, unknown>[]).map(normaliseCustomerRow)),
        error: (error) => reject(error)
      });
    });
  }

  const arrayBuffer = await (file.arrayBuffer ? file.arrayBuffer() : new Response(file).arrayBuffer());
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return json.map(normaliseCustomerRow);
}

