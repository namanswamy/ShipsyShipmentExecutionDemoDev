// Charge definitions and type mappings

export type ChargeType = 'Incidental' | 'Self-Reimbursement' | 'Third-Party Reimbursement';

export type ChargeLevel = 'BL' | 'Container';

export interface ChargeDefinition {
  name: string;
  type: ChargeType;
  level: ChargeLevel;
}

// SAC code mapping for each charge (displayed in detail tables and approver screen)
export const SAC_CODES: Record<string, string> = {
  'Loading charges': '9965',
  'Storage charges': '9967',
  'Storage Fees': '9967',
  'Documentation charges': '9971',
  'Special equipment charges': '9973',
  'Agency charges': '9985',
  'License charges': '9991',
  'Registration charges': '9983',
  'Transport Fee': '9965',
  'Handling Charges': '9986',
  'Detention charges': '9967',
  'Equipment charges': '9973',
  'Labelling fees': '9988',
  'Port Handling Fee': '9966',
  'Wharfage charges': '9969',
  'Freight recovery': '9965',
  'Survey charges': '9983',
  'Inspection fees': '9983',
  'Fumigation charges': '9985',
  'Seal charges': '9988',
  'Gate charges': '9969',
  'THC recovery': '9966',
  'B/L amendment fees': '9971',
  'Customs exam fees': '9984',
};

export const CHARGE_LIST: ChargeDefinition[] = [
  { name: 'Loading charges', type: 'Incidental', level: 'BL' },
  { name: 'Storage charges', type: 'Incidental', level: 'Container' },
  { name: 'Documentation charges', type: 'Self-Reimbursement', level: 'BL' },
  { name: 'Special equipment charges', type: 'Self-Reimbursement', level: 'Container' },
  { name: 'Agency charges', type: 'Third-Party Reimbursement', level: 'BL' },
  { name: 'License charges', type: 'Third-Party Reimbursement', level: 'Container' },
  { name: 'Registration charges', type: 'Third-Party Reimbursement', level: 'Container' },
];

export const CHARGE_TYPE_MAP: Record<string, ChargeType> = {};
export const CHARGE_LEVEL_MAP: Record<string, ChargeLevel> = {};
CHARGE_LIST.forEach(c => { CHARGE_TYPE_MAP[c.name] = c.type; CHARGE_LEVEL_MAP[c.name] = c.level; });

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
  // Approver response
  approverAction?: 'Approved' | 'Rejected' | '';
  approverRemark?: string;
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
  // Approver response
  approverAction?: 'Approved' | 'Rejected' | '';
  approverRemark?: string;
}

export function createDemoBLRows(): BLRow[] {
  return [
    { id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: false, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
    { id: 'bl2', blNo: 'BL002', blDate: '15-03-2026', selected: false, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
  ];
}

// BL-level charges always have exactly 1 BL (1 ASN = 1 BL)
export function createSingleBLRow(): BLRow[] {
  return [
    { id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: false, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
  ];
}

export function createDemoContainerRows(): ContainerRow[] {
  return [
    { id: 'cn1', containerNo: 'CN001', date: '12-03-2026', selected: false, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
    { id: 'cn2', containerNo: 'CN002', date: '12-03-2026', selected: false, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
    { id: 'cn3', containerNo: 'CN003', date: '12-03-2026', selected: false, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '' },
  ];
}

// Incidental type: rates are pre-filled from contract
export const INCIDENTAL_RATES: Record<string, { blRate: number; containerRate: number }> = {
  'Loading charges': { blRate: 800, containerRate: 350 },
  'Storage charges': { blRate: 1200, containerRate: 500 },
};

// CHA-specific pre-filled rates for Self-Reimbursement (editable, max = pre-filled value)
export const CHA_SELF_REIMB_RATES: Record<string, { blRate: number; containerRate: number }> = {
  'Documentation charges': { blRate: 1500, containerRate: 0 },
  'Special equipment charges': { blRate: 0, containerRate: 750 },
};

// CHA-specific pre-filled data for Third-Party Reimbursement (editable, max = pre-filled basicValue)
export const CHA_THIRD_PARTY_PREFILL: Record<string, {
  blPrefill?: { basicValue: string; cgst: string; sgst: string; igst: string; tpInvoiceNo: string; tpInvoiceDate: string; tpVendorCode: string; tpVendorName: string };
  containerPrefill?: { basicValue: string; cgst: string; sgst: string; igst: string; tpInvoiceNo: string; tpInvoiceDate: string; tpVendorCode: string; tpVendorName: string };
}> = {
  'Agency charges': {
    blPrefill: { basicValue: '600', cgst: '54', sgst: '54', igst: '', tpInvoiceNo: 'INV401', tpInvoiceDate: '2026-03-14', tpVendorCode: 'VND003', tpVendorName: 'PQR Shipping Agency' },
  },
  'License charges': {
    containerPrefill: { basicValue: '350', cgst: '', sgst: '', igst: '63', tpInvoiceNo: 'INV501', tpInvoiceDate: '2026-03-16', tpVendorCode: 'VND002', tpVendorName: 'XYZ Freight Services' },
  },
};

// Third party vendor codes
export const TP_VENDOR_OPTIONS = [
  { code: 'VND001', name: 'ABC Logistics Pvt Ltd' },
  { code: 'VND002', name: 'XYZ Freight Services' },
  { code: 'VND003', name: 'PQR Shipping Agency' },
  { code: 'VND004', name: 'Global Trade Solutions' },
];

// GST is now manual input:
// - CGST auto-fills SGST with same value
// - If CGST or SGST present → IGST blocked
// - If IGST present → CGST and SGST blocked

// ── Pre-filled demo incidental drafts for Demo shipments ──

// Demo 2: Mixed approver response (Approved + Rejected)
export function createDemo2Draft() {
  return {
    selectedCharges: [
      { name: 'Loading charges', type: 'Incidental' as ChargeType },
      { name: 'Documentation charges', type: 'Self-Reimbursement' as ChargeType },
      { name: 'Agency charges', type: 'Third-Party Reimbursement' as ChargeType },
    ],
    chargeData: [
      {
        chargeName: 'Loading charges', chargeType: 'Incidental' as ChargeType, chargeLevel: 'BL' as ChargeLevel,
        blRows: [{ id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Approved' as const, approverRemark: 'Rate verified against contract' }],
        containerRows: [],
      },
      {
        chargeName: 'Documentation charges', chargeType: 'Self-Reimbursement' as ChargeType, chargeLevel: 'BL' as ChargeLevel,
        blRows: [{ id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: true, rate: '1200', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Rejected' as const, approverRemark: 'Please attach supporting invoice document' }],
        containerRows: [],
      },
      {
        chargeName: 'Agency charges', chargeType: 'Third-Party Reimbursement' as ChargeType, chargeLevel: 'BL' as ChargeLevel,
        blRows: [{ id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: 'INV101', tpInvoiceDate: '2026-03-14', tpInvoiceValue: '590.00', basicValue: '500', cgst: '45', sgst: '45', igst: '', tpVendorCode: 'VND001', tpVendorName: 'ABC Logistics Pvt Ltd', approverAction: 'Rejected' as const, approverRemark: 'Rate not as per contract terms, exceeds approved limit' }],
        containerRows: [],
      },
    ],
    phase: 'detail' as const,
    sentForApproval: true,
  };
}

// Demo 3: All Rejected
export function createDemo3Draft() {
  return {
    selectedCharges: [
      { name: 'Storage charges', type: 'Incidental' as ChargeType },
      { name: 'Special equipment charges', type: 'Self-Reimbursement' as ChargeType },
    ],
    chargeData: [
      {
        chargeName: 'Storage charges', chargeType: 'Incidental' as ChargeType, chargeLevel: 'Container' as ChargeLevel,
        blRows: [],
        containerRows: [
          { id: 'cn1', containerNo: 'CN001', date: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Rejected' as const, approverRemark: 'Storage rate exceeds approved limit by 40%' },
          { id: 'cn2', containerNo: 'CN002', date: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Rejected' as const, approverRemark: 'No supporting documentation provided' },
        ],
      },
      {
        chargeName: 'Special equipment charges', chargeType: 'Self-Reimbursement' as ChargeType, chargeLevel: 'Container' as ChargeLevel,
        blRows: [],
        containerRows: [
          { id: 'cn1', containerNo: 'CN001', date: '12-03-2026', selected: true, rate: '800', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Rejected' as const, approverRemark: 'Equipment charges not covered under current contract' },
          { id: 'cn2', containerNo: 'CN002', date: '12-03-2026', selected: true, rate: '800', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Rejected' as const, approverRemark: 'Duplicate charge — already claimed in previous cycle' },
        ],
      },
    ],
    phase: 'detail' as const,
    sentForApproval: true,
  };
}

// Demo 4: All Approved
export function createDemo4Draft() {
  return {
    selectedCharges: [
      { name: 'Loading charges', type: 'Incidental' as ChargeType },
      { name: 'Documentation charges', type: 'Self-Reimbursement' as ChargeType },
      { name: 'License charges', type: 'Third-Party Reimbursement' as ChargeType },
    ],
    chargeData: [
      {
        chargeName: 'Loading charges', chargeType: 'Incidental' as ChargeType, chargeLevel: 'BL' as ChargeLevel,
        blRows: [{ id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Approved' as const, approverRemark: 'Verified and approved' }],
        containerRows: [],
      },
      {
        chargeName: 'Documentation charges', chargeType: 'Self-Reimbursement' as ChargeType, chargeLevel: 'BL' as ChargeLevel,
        blRows: [{ id: 'bl1', blNo: 'BL001', blDate: '12-03-2026', selected: true, rate: '950', currency: 'USD', attachment: '', tpInvoiceNo: '', tpInvoiceDate: '', tpInvoiceValue: '', basicValue: '', cgst: '', sgst: '', igst: '', tpVendorCode: '', tpVendorName: '', approverAction: 'Approved' as const, approverRemark: 'Rate within contract limits' }],
        containerRows: [],
      },
      {
        chargeName: 'License charges', chargeType: 'Third-Party Reimbursement' as ChargeType, chargeLevel: 'Container' as ChargeLevel,
        blRows: [],
        containerRows: [
          { id: 'cn1', containerNo: 'CN001', date: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: 'INV301', tpInvoiceDate: '2026-03-15', tpInvoiceValue: '354.00', basicValue: '300', cgst: '27', sgst: '27', igst: '', tpVendorCode: 'VND002', tpVendorName: 'XYZ Freight Services', approverAction: 'Approved' as const, approverRemark: 'All documentation verified' },
          { id: 'cn2', containerNo: 'CN002', date: '12-03-2026', selected: true, rate: '', currency: 'USD', attachment: '', tpInvoiceNo: 'INV302', tpInvoiceDate: '2026-03-15', tpInvoiceValue: '354.00', basicValue: '300', cgst: '27', sgst: '27', igst: '', tpVendorCode: 'VND002', tpVendorName: 'XYZ Freight Services', approverAction: 'Approved' as const, approverRemark: 'Approved — consistent with prior claims' },
        ],
      },
    ],
    phase: 'detail' as const,
    sentForApproval: true,
  };
}
