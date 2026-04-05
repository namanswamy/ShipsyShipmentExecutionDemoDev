// Charge definitions and type mappings

export type ChargeType = 'Incidental' | 'Self-Reimbursement' | 'Third-Party Reimbursement';

export interface ChargeDefinition {
  name: string;
  type: ChargeType;
}

export const CHARGE_LIST: ChargeDefinition[] = [
  { name: 'Loading charges', type: 'Incidental' },
  { name: 'Storage charges', type: 'Incidental' },
  { name: 'Documentation charges', type: 'Self-Reimbursement' },
  { name: 'Special equipment charges', type: 'Self-Reimbursement' },
  { name: 'Agency charges', type: 'Third-Party Reimbursement' },
  { name: 'License charges', type: 'Third-Party Reimbursement' },
  { name: 'Registration charges', type: 'Third-Party Reimbursement' },
];

export const CHARGE_TYPE_MAP: Record<string, ChargeType> = {};
CHARGE_LIST.forEach(c => { CHARGE_TYPE_MAP[c.name] = c.type; });

// Demo BL data
export interface BLRow {
  id: string;
  blNo: string;
  blDate: string;
  selected: boolean;
  rate: string;
  currency: string;
  attachment: string;
  // Third party fields
  tpInvoiceNo: string;
  tpInvoiceDate: string;
  tpInvoiceValue: string;
  basicValue: string;
  cgst: string;
  sgst: string;
  igst: string;
  tpVendorCode: string;
  tpVendorName: string;
}

// Demo Container data
export interface ContainerRow {
  id: string;
  containerNo: string;
  date: string;
  selected: boolean;
  rate: string;
  currency: string;
  attachment: string;
  // Third party fields
  tpInvoiceNo: string;
  tpInvoiceDate: string;
  tpInvoiceValue: string;
  basicValue: string;
  cgst: string;
  sgst: string;
  igst: string;
  tpVendorCode: string;
  tpVendorName: string;
}

export function createDemoBLRows(): BLRow[] {
  return [
    { id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: false, rate: '', currency: 'INR', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
    { id: 'bl2', blNo: 'BL002', blDate: '15-03-2026', selected: false, rate: '', currency: 'INR', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
  ];
}

export function createDemoContainerRows(): ContainerRow[] {
  return [
    { id: 'cn1', containerNo: 'CN001', date: '12-03-2026', selected: false, rate: '', currency: 'INR', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
    { id: 'cn2', containerNo: 'CN002', date: '12-03-2026', selected: false, rate: '', currency: 'INR', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
    { id: 'cn3', containerNo: 'CN003', date: '12-03-2026', selected: false, rate: '', currency: 'INR', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
  ];
}

// Incidental type: rates are pre-filled from contract
export const INCIDENTAL_RATES: Record<string, { blRate: number; containerRate: number }> = {
  'Loading charges': { blRate: 800, containerRate: 350 },
  'Storage charges': { blRate: 1200, containerRate: 500 },
};

// Third party vendor codes
export const TP_VENDOR_OPTIONS = [
  { code: 'VND001', name: 'ABC Logistics Pvt Ltd' },
  { code: 'VND002', name: 'XYZ Freight Services' },
  { code: 'VND003', name: 'PQR Shipping Agency' },
  { code: 'VND004', name: 'Global Trade Solutions' },
];

// GST auto-fill rates (dummy)
export function autoFillGST(basicValue: string): { cgst: string; sgst: string; igst: string } {
  const bv = parseFloat(basicValue) || 0;
  // Intra-state: CGST 9% + SGST 9%, Inter-state: IGST 18%
  // For demo, use intra-state
  return {
    cgst: (bv * 0.09).toFixed(2),
    sgst: (bv * 0.09).toFixed(2),
    igst: '0.00',
  };
}
