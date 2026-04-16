// Invoice Module - Mock Data

export type InvoiceStatus = 'REVIEW_PENDING' | 'APPROVED' | 'DISPUTE_RAISED' | 'PAID' | 'SETTLED' | 'RECEIVED';

export type InvoiceTab = 'payables' | 'receivables' | 'invoicing';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  internalRef?: string;
  billNumber?: string;
  shipmentNumber?: string;
  hslNumber?: string;
  awbNumber?: string;
  customerName: string;
  invoiceType: string;
  invoiceDate: string;
  price: number;
  currency: string;
  taxes: number;
  status: InvoiceStatus;
  dueDate: string;
  dueDateLabel: string;
  amountPaid: number;
  balance: number;
  hasRemark: boolean;
  hasViewBreakdown: boolean;
  hasInvoiceFile: boolean;
  hasPaymentProof: boolean;
  tab: InvoiceTab;
}

// Status badge colors
export const statusBadgeColors: Record<InvoiceStatus, string> = {
  REVIEW_PENDING: '#F8DE61',
  APPROVED: '#DEF569',
  DISPUTE_RAISED: '#FDA782',
  PAID: '#86EAB2',
  SETTLED: '#CDCDCD',
  RECEIVED: '#86EAB2',
};

// Status display names
export const statusDisplayNames: Record<InvoiceStatus, string> = {
  REVIEW_PENDING: 'Review Pending',
  APPROVED: 'Approved',
  DISPUTE_RAISED: 'Dispute Raised',
  PAID: 'Paid',
  SETTLED: 'Settled',
  RECEIVED: 'Received',
};

// Card border/background per status
export const statusCardStyles: Record<InvoiceStatus, { bg: string; border: string; colBorder: string }> = {
  PAID: { bg: '#FFFFFF', border: '1px solid #4AD788', colBorder: '1px solid #E8E8E8' },
  DISPUTE_RAISED: { bg: '#FFF1EA', border: '1px solid #D7A996', colBorder: '1px solid #D7A996' },
  APPROVED: { bg: '#FFFFFF', border: '1px solid #D9D9D9', colBorder: '1px solid #E8E8E8' },
  SETTLED: { bg: '#F7F7F7', border: '1px solid #D9D9D9', colBorder: '1px solid #E8E8E8' },
  REVIEW_PENDING: { bg: '#FFFFFF', border: '1px solid #D9D9D9', colBorder: '1px solid #D9D9D9' },
  RECEIVED: { bg: '#FFFFFF', border: '1px solid #4AD788', colBorder: '1px solid #E8E8E8' },
};

// Payables invoices (from screenshot)
export const payableInvoices: Invoice[] = [
  {
    id: 'p1',
    invoiceNumber: 'INVOICE098',
    internalRef: 'Reliance Goods',
    billNumber: 'BL01018',
    shipmentNumber: 'SEAZLC2814',
    customerName: 'Liberty Forwarding',
    invoiceType: 'Freight Invoice',
    invoiceDate: '08 Apr, 2026',
    price: 1772.32,
    currency: '$',
    taxes: 282.2,
    status: 'APPROVED',
    dueDate: '2026-07-07',
    dueDateLabel: 'Due: 07 Jul, 2026',
    amountPaid: 0,
    balance: 2054.52,
    hasRemark: true,
    hasViewBreakdown: true,
    hasInvoiceFile: true,
    hasPaymentProof: false,
    tab: 'payables',
  },
  {
    id: 'p2',
    invoiceNumber: 'demo91',
    internalRef: 'demoeximitest11',
    billNumber: undefined,
    shipmentNumber: 'BKAZLC0155',
    customerName: 'Liberty Forwarding',
    invoiceType: 'Freight Invoice',
    invoiceDate: '17 Feb, 2026',
    price: 1037.46,
    currency: '$',
    taxes: 0,
    status: 'REVIEW_PENDING',
    dueDate: '2026-03-15',
    dueDateLabel: 'Due: a month ago',
    amountPaid: 0,
    balance: 1037.46,
    hasRemark: false,
    hasViewBreakdown: true,
    hasInvoiceFile: false,
    hasPaymentProof: false,
    tab: 'payables',
  },
  {
    id: 'p3',
    invoiceNumber: 'Demo99',
    internalRef: 'demoeximitest1',
    billNumber: undefined,
    shipmentNumber: 'BKAZLC0113',
    customerName: 'Liberty Forwarding',
    invoiceType: 'Freight Invoice',
    invoiceDate: '17 Feb, 2026',
    price: 277.18,
    currency: '$',
    taxes: 0,
    status: 'APPROVED',
    dueDate: '2026-03-10',
    dueDateLabel: 'Due: a month ago',
    amountPaid: 0,
    balance: 277.18,
    hasRemark: false,
    hasViewBreakdown: false,
    hasInvoiceFile: false,
    hasPaymentProof: false,
    tab: 'payables',
  },
  {
    id: 'p4',
    invoiceNumber: '76453',
    shipmentNumber: 'BKAZLC0201',
    customerName: 'Liberty Forwarding',
    invoiceType: 'Freight Invoice',
    invoiceDate: '13 Sep, 2025',
    price: 3412.77,
    currency: '$',
    taxes: 582.59,
    status: 'APPROVED',
    dueDate: '2025-10-15',
    dueDateLabel: 'Due: 6 months ago',
    amountPaid: 0,
    balance: 3995.36,
    hasRemark: false,
    hasViewBreakdown: false,
    hasInvoiceFile: false,
    hasPaymentProof: false,
    tab: 'payables',
  },
  {
    id: 'p5',
    invoiceNumber: '666555',
    shipmentNumber: 'BKAZLC0290',
    customerName: 'Liberty Forwarding',
    invoiceType: 'Freight + Locals Invoice',
    invoiceDate: '14 Sep, 2025',
    price: 10.38,
    currency: '$',
    taxes: 0,
    status: 'APPROVED',
    dueDate: '2025-09-20',
    dueDateLabel: 'Due: 7 months ago',
    amountPaid: 0,
    balance: 10.38,
    hasRemark: false,
    hasViewBreakdown: false,
    hasInvoiceFile: false,
    hasPaymentProof: false,
    tab: 'payables',
  },
];

// Receivables invoices (from screenshot)
export const receivableInvoices: Invoice[] = [
  {
    id: 'r1',
    invoiceNumber: 'adfsd',
    hslNumber: 'wdeda',
    shipmentNumber: 'SEAZLC3067',
    customerName: 'RAJ1',
    invoiceType: 'Freight Invoice',
    invoiceDate: '13 Mar, 2026',
    price: 900400,
    currency: '$',
    taxes: 162054,
    status: 'SETTLED',
    dueDate: '2026-03-28',
    dueDateLabel: 'Due: 19 days ago',
    amountPaid: 1062454,
    balance: 0,
    hasRemark: false,
    hasViewBreakdown: true,
    hasInvoiceFile: true,
    hasPaymentProof: true,
    tab: 'receivables',
  },
  {
    id: 'r2',
    invoiceNumber: '1234',
    shipmentNumber: 'BKAZLC0512',
    customerName: 'FFDemo4',
    invoiceType: 'Freight Invoice',
    invoiceDate: '17 Feb, 2026',
    price: 22,
    currency: '$',
    taxes: 22,
    status: 'REVIEW_PENDING',
    dueDate: '2026-03-10',
    dueDateLabel: 'Due: a month ago',
    amountPaid: 0,
    balance: 44.00,
    hasRemark: false,
    hasViewBreakdown: false,
    hasInvoiceFile: true,
    hasPaymentProof: false,
    tab: 'receivables',
  },
  {
    id: 'r3',
    invoiceNumber: '23789543217',
    awbNumber: '123098765445',
    shipmentNumber: undefined,
    customerName: "Kellogg's Customer",
    invoiceType: 'Freight Invoice',
    invoiceDate: '20 Nov, 2025',
    price: 1129.52,
    currency: '$',
    taxes: 1.13,
    status: 'REVIEW_PENDING',
    dueDate: '2025-12-15',
    dueDateLabel: 'Due: 4 months ago',
    amountPaid: 0,
    balance: 100100.00,
    hasRemark: false,
    hasViewBreakdown: false,
    hasInvoiceFile: true,
    hasPaymentProof: false,
    tab: 'receivables',
  },
  {
    id: 'r4',
    invoiceNumber: '1234',
    shipmentNumber: undefined,
    customerName: 'tesdt org2',
    invoiceType: 'Others',
    invoiceDate: '20 Aug, 2025',
    price: 8.763,
    currency: '$',
    taxes: 113.128,
    status: 'REVIEW_PENDING',
    dueDate: '2025-08-25',
    dueDateLabel: 'Due: 8 months ago',
    amountPaid: 0,
    balance: 10641.00,
    hasRemark: false,
    hasViewBreakdown: false,
    hasInvoiceFile: true,
    hasPaymentProof: false,
    tab: 'receivables',
  },
  {
    id: 'r5',
    invoiceNumber: 'INV6222',
    internalRef: 'INTER_NUM1',
    hslNumber: 'BL982371948132',
    shipmentNumber: undefined,
    customerName: 'Namrataff Pvt Ltd',
    invoiceType: 'Demurrage Invoice',
    invoiceDate: '22 Dec, 2022',
    price: 123,
    currency: '$',
    taxes: 12,
    status: 'REVIEW_PENDING',
    dueDate: '2023-01-15',
    dueDateLabel: 'Due: 3 years ago',
    amountPaid: 0,
    balance: 135.00,
    hasRemark: true,
    hasViewBreakdown: false,
    hasInvoiceFile: false,
    hasPaymentProof: false,
    tab: 'receivables',
  },
];

// Status tab counts
export function getStatusCounts(invoices: Invoice[]) {
  const counts: Record<string, number> = {
    ALL: invoices.length,
    REVIEW_PENDING: 0,
    APPROVED: 0,
    DISPUTE_RAISED: 0,
    PAID: 0,
    SETTLED: 0,
    RECEIVED: 0,
  };
  invoices.forEach(inv => {
    if (counts[inv.status] !== undefined) {
      counts[inv.status]++;
    }
  });
  return counts;
}
