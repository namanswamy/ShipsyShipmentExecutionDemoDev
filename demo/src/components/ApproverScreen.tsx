import React, { useState, useMemo } from 'react';

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

type ChargeLevelType = 'BL' | 'Container';

interface ChargeLineItem {
  id: string;
  chargeDesc: string;
  chargeLevel: ChargeLevelType;
  blNo: string;
  blDate: string;
  containerNo: string;
  rate: number;
  currency: string;
  chargeType: 'Incidental' | 'Self-Reimbursement' | 'Third-Party Reimbursement';
  tpInvoiceNo?: string;
  tpInvoiceDate?: string;
  tpInvoiceValue?: number;
  basicValue?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  tpVendorCode?: string;
  tpVendorName?: string;
  action?: 'Approved' | 'Rejected' | '';
  remark?: string;
}

interface ClaimRow {
  claimId: string;
  vendorType: string;
  vendorName: string;
  vendorCode: string;
  business: string;
  chargesClaimed: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  asnNo: string;
  workflowId: string;
  charges: ChargeLineItem[];
}

// ════════════════════════════════════════════════════
// Demo Data — 10 claims
// ════════════════════════════════════════════════════

const DEMO_CLAIMS: ClaimRow[] = [
  {
    claimId: 'CLM001', vendorType: 'FF', vendorName: 'ABC Logistics', vendorCode: 'V001',
    business: 'Petchem', chargesClaimed: 7, totalAmount: 1700, status: 'Pending - New',
    createdAt: '10-02-2026 11:50:20', asnNo: 'ASN001', workflowId: 'WF001',
    charges: [
      { id: 'c1', chargeDesc: 'Storage Fees', chargeLevel: 'BL', blNo: 'BL001', blDate: '12-Mar-26', containerNo: '-', rate: 400, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c2', chargeDesc: 'Transport Fee', chargeLevel: 'BL', blNo: 'BL001', blDate: '12-Mar-26', containerNo: '-', rate: 300, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c3', chargeDesc: 'Handling Charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 150, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c4', chargeDesc: 'Handling Charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN002', rate: 150, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c5', chargeDesc: 'Detention charges', chargeLevel: 'BL', blNo: 'BL001', blDate: '12-Mar-26', containerNo: '-', rate: 400, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c6', chargeDesc: 'Equipment charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 150, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c7', chargeDesc: 'Equipment charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN002', rate: 150, currency: 'INR', chargeType: 'Self-Reimbursement' },
    ],
  },
  {
    claimId: 'CLM002', vendorType: 'CHA', vendorName: 'XYZ Cargo', vendorCode: 'V002',
    business: 'Retail', chargesClaimed: 1, totalAmount: 1200, status: 'Pending - Resubmitted',
    createdAt: '11-02-2026 09:30:15', asnNo: 'ASN001', workflowId: 'WF002',
    charges: [
      { id: 'c8', chargeDesc: 'Documentation charges', chargeLevel: 'BL', blNo: 'BL001', blDate: '12-Mar-26', containerNo: '-', rate: 1200, currency: 'INR', chargeType: 'Self-Reimbursement' },
    ],
  },
  {
    claimId: 'CLM003', vendorType: 'CFS', vendorName: 'DEF CFS', vendorCode: 'V003',
    business: 'Retail', chargesClaimed: 2, totalAmount: 900, status: 'Pending - New',
    createdAt: '12-02-2026 14:20:00', asnNo: 'ASN002', workflowId: 'WF001',
    charges: [
      { id: 'c9', chargeDesc: 'Loading charges', chargeLevel: 'BL', blNo: 'BL001', blDate: '12-Mar-26', containerNo: '-', rate: 500, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c10', chargeDesc: 'Loading charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 400, currency: 'INR', chargeType: 'Incidental' },
    ],
  },
  {
    claimId: 'CLM004', vendorType: 'Transporter', vendorName: 'TCI Freight', vendorCode: 'V004',
    business: 'Petchem', chargesClaimed: 3, totalAmount: 1450, status: 'Pending - New',
    createdAt: '13-02-2026 16:45:30', asnNo: 'ASN002', workflowId: 'WF003',
    charges: [
      { id: 'c11', chargeDesc: 'Labelling fees', chargeLevel: 'BL', blNo: 'BL001', blDate: '14-Mar-26', containerNo: '-', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: '123', tpInvoiceDate: '14-03-2026', tpInvoiceValue: 118, basicValue: 100, cgst: 9, sgst: 9, igst: 0, tpVendorCode: 'VND001', tpVendorName: 'ABC Logistics Pvt Ltd' },
      { id: 'c12', chargeDesc: 'Agency charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: '456', tpInvoiceDate: '14-03-2026', tpInvoiceValue: 118, basicValue: 100, cgst: 0, sgst: 0, igst: 18, tpVendorCode: 'VND002', tpVendorName: 'XYZ Freight Services' },
      { id: 'c13', chargeDesc: 'Agency charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN002', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: '789', tpInvoiceDate: '14-03-2026', tpInvoiceValue: 118, basicValue: 100, cgst: 0, sgst: 0, igst: 18, tpVendorCode: 'VND002', tpVendorName: 'XYZ Freight Services' },
    ],
  },
  {
    claimId: 'CLM005', vendorType: 'FF', vendorName: 'Phoenix Global', vendorCode: 'V005',
    business: 'Jio', chargesClaimed: 4, totalAmount: 2200, status: 'Pending - New',
    createdAt: '14-02-2026 10:15:00', asnNo: 'ASN003', workflowId: 'WF002',
    charges: [
      { id: 'c14', chargeDesc: 'Storage Fees', chargeLevel: 'BL', blNo: 'BL001', blDate: '15-Mar-26', containerNo: '-', rate: 600, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c15', chargeDesc: 'Storage Fees', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 350, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c16', chargeDesc: 'Documentation charges', chargeLevel: 'BL', blNo: 'BL001', blDate: '15-Mar-26', containerNo: '-', rate: 800, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c17', chargeDesc: 'Special equipment charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN002', rate: 450, currency: 'INR', chargeType: 'Self-Reimbursement' },
    ],
  },
  {
    claimId: 'CLM006', vendorType: 'ICD', vendorName: 'CONCOR Tughlakabad', vendorCode: 'V006',
    business: 'Petchem', chargesClaimed: 2, totalAmount: 750, status: 'Pending - New',
    createdAt: '15-02-2026 08:00:00', asnNo: 'ASN003', workflowId: 'WF004',
    charges: [
      { id: 'c18', chargeDesc: 'Loading charges', chargeLevel: 'BL', blNo: 'BL002', blDate: '16-Mar-26', containerNo: '-', rate: 450, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c19', chargeDesc: 'Loading charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN003', rate: 300, currency: 'INR', chargeType: 'Incidental' },
    ],
  },
  {
    claimId: 'CLM007', vendorType: 'CHA', vendorName: 'Sharaf Shipping', vendorCode: 'V007',
    business: 'Retail', chargesClaimed: 3, totalAmount: 1850, status: 'Pending - Resubmitted',
    createdAt: '16-02-2026 13:30:45', asnNo: 'ASN004', workflowId: 'WF003',
    charges: [
      { id: 'c20', chargeDesc: 'Registration charges', chargeLevel: 'BL', blNo: 'BL001', blDate: '18-Mar-26', containerNo: '-', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: '901', tpInvoiceDate: '18-03-2026', tpInvoiceValue: 590, basicValue: 500, cgst: 45, sgst: 45, igst: 0, tpVendorCode: 'VND003', tpVendorName: 'PQR Shipping Agency' },
      { id: 'c21', chargeDesc: 'Detention charges', chargeLevel: 'BL', blNo: 'BL001', blDate: '18-Mar-26', containerNo: '-', rate: 650, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c22', chargeDesc: 'Equipment charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 610, currency: 'INR', chargeType: 'Self-Reimbursement' },
    ],
  },
  {
    claimId: 'CLM008', vendorType: 'Transporter', vendorName: 'Gati KWE', vendorCode: 'V008',
    business: 'Jio', chargesClaimed: 2, totalAmount: 980, status: 'Pending - New',
    createdAt: '17-02-2026 17:10:00', asnNo: 'ASN004', workflowId: 'WF005',
    charges: [
      { id: 'c23', chargeDesc: 'Loading charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN001', rate: 490, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c24', chargeDesc: 'Loading charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN002', rate: 490, currency: 'INR', chargeType: 'Incidental' },
    ],
  },
  // CLM009 — all 3 charge types in one claim
  {
    claimId: 'CLM009', vendorType: 'FF', vendorName: 'Maersk Logistics', vendorCode: 'V009',
    business: 'Petchem', chargesClaimed: 6, totalAmount: 3150, status: 'Pending - New',
    createdAt: '18-02-2026 09:00:00', asnNo: 'ASN002', workflowId: 'WF001',
    charges: [
      { id: 'c25', chargeDesc: 'Port Handling Fee', chargeLevel: 'BL', blNo: 'BL003', blDate: '20-Mar-26', containerNo: '-', rate: 500, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c26', chargeDesc: 'Wharfage charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN004', rate: 350, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c27', chargeDesc: 'Freight recovery', chargeLevel: 'BL', blNo: 'BL003', blDate: '20-Mar-26', containerNo: '-', rate: 800, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c28', chargeDesc: 'Survey charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN004', rate: 500, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c29', chargeDesc: 'Inspection fees', chargeLevel: 'BL', blNo: 'BL003', blDate: '20-Mar-26', containerNo: '-', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: 'INV201', tpInvoiceDate: '20-03-2026', tpInvoiceValue: 590, basicValue: 500, cgst: 45, sgst: 45, igst: 0, tpVendorCode: 'VND004', tpVendorName: 'Global Inspection Ltd' },
      { id: 'c30', chargeDesc: 'Fumigation charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN004', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: 'INV202', tpInvoiceDate: '20-03-2026', tpInvoiceValue: 413, basicValue: 350, cgst: 0, sgst: 0, igst: 63, tpVendorCode: 'VND005', tpVendorName: 'PestFree Services Pvt Ltd' },
    ],
  },
  // CLM010 — all 3 charge types in one claim
  {
    claimId: 'CLM010', vendorType: 'CHA', vendorName: 'Allcargo Logistics', vendorCode: 'V010',
    business: 'Retail', chargesClaimed: 5, totalAmount: 2780, status: 'Pending - New',
    createdAt: '19-02-2026 11:20:00', asnNo: 'ASN003', workflowId: 'WF002',
    charges: [
      { id: 'c31', chargeDesc: 'Seal charges', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN005', rate: 300, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c32', chargeDesc: 'Gate charges', chargeLevel: 'BL', blNo: 'BL004', blDate: '22-Mar-26', containerNo: '-', rate: 480, currency: 'INR', chargeType: 'Incidental' },
      { id: 'c33', chargeDesc: 'THC recovery', chargeLevel: 'BL', blNo: 'BL004', blDate: '22-Mar-26', containerNo: '-', rate: 700, currency: 'INR', chargeType: 'Self-Reimbursement' },
      { id: 'c34', chargeDesc: 'B/L amendment fees', chargeLevel: 'BL', blNo: 'BL004', blDate: '22-Mar-26', containerNo: '-', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: 'INV301', tpInvoiceDate: '22-03-2026', tpInvoiceValue: 826, basicValue: 700, cgst: 63, sgst: 63, igst: 0, tpVendorCode: 'VND006', tpVendorName: 'Shipping Line Agency Co.' },
      { id: 'c35', chargeDesc: 'Customs exam fees', chargeLevel: 'Container', blNo: '-', blDate: '', containerNo: 'CN005', rate: 0, currency: 'INR', chargeType: 'Third-Party Reimbursement', tpInvoiceNo: 'INV302', tpInvoiceDate: '22-03-2026', tpInvoiceValue: 472, basicValue: 400, cgst: 36, sgst: 36, igst: 0, tpVendorCode: 'VND007', tpVendorName: 'ClearFast Customs Pvt Ltd' },
    ],
  },
];

const ASN_OPTIONS = ['All', 'ASN001', 'ASN002', 'ASN003', 'ASN004'];
const BUSINESS_OPTIONS = ['All', 'Petchem', 'Retail', 'Jio'];
const VENDOR_TYPE_OPTIONS = ['All', 'FF', 'CHA', 'CFS', 'ICD', 'Surveyor', 'Transporter'];
const WORKFLOW_OPTIONS = ['All', 'WF001', 'WF002', 'WF003', 'WF004', 'WF005'];

// Dummy vendor codes per vendor type
const VENDOR_CODES_BY_TYPE: Record<string, { code: string; name: string }[]> = {
  FF: [
    { code: 'V001', name: 'ABC Logistics' },
    { code: 'V005', name: 'Phoenix Global' },
    { code: 'V009', name: 'Maersk Logistics' },
  ],
  CHA: [
    { code: 'V002', name: 'XYZ Cargo' },
    { code: 'V007', name: 'Sharaf Shipping' },
    { code: 'V010', name: 'Allcargo Logistics' },
  ],
  CFS: [
    { code: 'V003', name: 'DEF CFS' },
    { code: 'V011', name: 'Aegis CFS' },
  ],
  ICD: [
    { code: 'V006', name: 'CONCOR Tughlakabad' },
    { code: 'V012', name: 'MMLP Nagpur' },
  ],
  Surveyor: [
    { code: 'V013', name: 'Bureau Veritas' },
    { code: 'V014', name: 'SGS India' },
  ],
  Transporter: [
    { code: 'V004', name: 'TCI Freight' },
    { code: 'V008', name: 'Gati KWE' },
  ],
};

// ════════════════════════════════════════════════════
// Styles
// ════════════════════════════════════════════════════

const thStyle: React.CSSProperties = {
  padding: '8px 8px', fontSize: 10, fontWeight: 600, color: '#333',
  background: '#E3F2FD', borderBottom: '1px solid #BBDEFB', textAlign: 'left', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '8px 8px', fontSize: 11, borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle',
};
const actionBtn = (bg: string): React.CSSProperties => ({
  padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer',
  border: 'none', borderRadius: 3, color: '#333', background: bg, fontFamily: 'inherit',
});

// ════════════════════════════════════════════════════
// Remark Popup
// ════════════════════════════════════════════════════

const RemarkPopup: React.FC<{
  action: string;
  onOk: (remark: string) => void;
  onCancel: () => void;
}> = ({ action, onOk, onCancel }) => {
  const [remark, setRemark] = useState('');
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 24, width: 380,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 12 }}>
          {action === 'Approved' ? 'Approve' : 'Reject'} — Remarks
        </div>
        <textarea
          className="field-input"
          value={remark}
          onChange={e => setRemark(e.target.value)}
          placeholder="Enter remarks..."
          style={{ height: 80, padding: '8px 10px', resize: 'vertical', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{
            height: 30, padding: '0 14px', border: '1px solid #999', borderRadius: 4,
            background: '#fff', color: '#333', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={() => onOk(remark)} style={{
            height: 30, padding: '0 14px', border: 'none', borderRadius: 4,
            background: '#006EC3', color: '#fff', fontSize: 12, cursor: 'pointer',
            fontWeight: 600, fontFamily: 'inherit',
          }}>OK</button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// Inline Approval Detail (rendered below the claim row)
// ════════════════════════════════════════════════════

const InlineApprovalDetail: React.FC<{
  claim: ClaimRow;
  onClose: () => void;
  onUpdateClaim: (updated: ClaimRow) => void;
}> = ({ claim, onClose, onUpdateClaim }) => {
  const [charges, setCharges] = useState<ChargeLineItem[]>(claim.charges);
  const [popup, setPopup] = useState<{ idx: number; action: string } | null>(null);
  const [expandedRemarkId, setExpandedRemarkId] = useState<string | null>(null);

  const chargeTypes = useMemo(() => {
    const types = new Set(charges.map(c => c.chargeType));
    return Array.from(types);
  }, [charges]);

  const [activeTab, setActiveTab] = useState(chargeTypes[0] || 'Incidental');
  const activeCharges = charges.filter(c => c.chargeType === activeTab);

  const handleAction = (idx: number, action: 'Approved' | 'Rejected') => {
    setPopup({ idx, action });
  };

  const handlePopupOk = (remark: string) => {
    if (popup) {
      const globalIdx = charges.indexOf(activeCharges[popup.idx]);
      const updated = [...charges];
      updated[globalIdx] = { ...updated[globalIdx], action: popup.action as 'Approved' | 'Rejected', remark };
      setCharges(updated);
    }
    setPopup(null);
  };

  const handleSave = () => {
    onUpdateClaim({ ...claim, charges, status: 'Pending' });
    onClose();
  };

  const handleSubmit = () => {
    const allActioned = charges.every(c => c.action);
    if (!allActioned) { alert('Please action all charge items before submitting.'); return; }
    const allApproved = charges.every(c => c.action === 'Approved');
    let newStatus = 'Done';
    if (allApproved) newStatus = 'Approved';
    onUpdateClaim({ ...claim, charges, status: newStatus });
    onClose();
  };

  const isThirdParty = activeTab === 'Third-Party Reimbursement';
  const tabColors: Record<string, string> = {
    'Incidental': '#E65100', 'Self-Reimbursement': '#1565C0', 'Third-Party Reimbursement': '#2E7D32',
  };
  const activeColor = tabColors[activeTab] || '#006EC3';

  const truncateRemark = (text: string) => text.length > 15 ? text.slice(0, 15) + '...' : text;

  return (
    <tr>
      <td colSpan={11} style={{ padding: 0, background: '#F5F8FF' }}>
        <div style={{
          borderLeft: `4px solid ${activeColor}`,
          margin: '4px 8px 12px',
          borderRadius: 6,
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          background: '#fff',
          border: `1px solid #d0d9e8`,
          borderLeftColor: activeColor,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', background: '#F0F7FF', borderBottom: '1px solid #dce8f5',
            borderRadius: '6px 6px 0 0',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2b4a', letterSpacing: 0.3 }}>
              APPROVAL DETAILS — {claim.claimId}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} style={{
                height: 28, padding: '0 14px', border: '1px solid #006EC3', borderRadius: 4,
                background: '#fff', color: '#006EC3', fontSize: 11, cursor: 'pointer',
                fontWeight: 600, fontFamily: 'inherit',
              }}>Save</button>
              <button onClick={handleSubmit} style={{
                height: 28, padding: '0 14px', border: 'none', borderRadius: 4,
                background: '#006EC3', color: '#fff', fontSize: 11, cursor: 'pointer',
                fontWeight: 600, fontFamily: 'inherit',
              }}>Submit</button>
              <button onClick={onClose} style={{
                height: 28, padding: '0 10px', border: '1px solid #999', borderRadius: 4,
                background: '#fff', color: '#333', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}>&#10005;</button>
            </div>
          </div>

          {/* Charge type tabs */}
          <div style={{
            display: 'flex', padding: '0 20px', borderBottom: '1px solid #e8e8e8', background: '#fff',
          }}>
            {chargeTypes.map(type => (
              <button key={type} onClick={() => setActiveTab(type)} style={{
                padding: '10px 16px', fontSize: 11, fontFamily: 'inherit',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === type ? `3px solid ${tabColors[type] || '#006EC3'}` : '3px solid transparent',
                color: activeTab === type ? tabColors[type] || '#006EC3' : '#666',
                fontWeight: activeTab === type ? 700 : 400,
              }}>
                {type === 'Incidental' ? 'Incidental charges' : type === 'Self-Reimbursement' ? 'Self-Reimbursement charges' : 'Third Party Reimbursement'}
              </button>
            ))}
          </div>

          {/* Charges table */}
          <div style={{ padding: '14px 20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isThirdParty ? 1100 : 700 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Charge Description</th>
                  <th style={thStyle}>Charge Level</th>
                  <th style={thStyle}>BL No.</th>
                  {!isThirdParty && <th style={thStyle}>BL Date</th>}
                  <th style={thStyle}>Container No.</th>
                  {isThirdParty && <th style={thStyle}>3rd Party Invoice No.</th>}
                  {isThirdParty && <th style={thStyle}>3rd Party Invoice Date</th>}
                  {isThirdParty && <th style={thStyle}>3rd Party Invoice Value</th>}
                  {isThirdParty && <th style={thStyle}>Basic Value</th>}
                  {isThirdParty && <th style={thStyle}>CGST</th>}
                  {isThirdParty && <th style={thStyle}>SGST</th>}
                  {isThirdParty && <th style={thStyle}>IGST</th>}
                  {isThirdParty && <th style={thStyle}>Vendor Code</th>}
                  {isThirdParty && <th style={thStyle}>Vendor Name</th>}
                  {!isThirdParty && <th style={thStyle}>Rate</th>}
                  {!isThirdParty && <th style={thStyle}>Currency</th>}
                  <th style={thStyle}>Attachment</th>
                  <th style={{ ...thStyle, minWidth: 120 }}>Remarks</th>
                  <th style={{ ...thStyle, minWidth: 160 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeCharges.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={tdStyle}>{c.chargeDesc}</td>
                    <td style={tdStyle}>{c.chargeLevel}</td>
                    <td style={tdStyle}>{c.blNo}</td>
                    {!isThirdParty && <td style={tdStyle}>{c.blDate || '-'}</td>}
                    <td style={tdStyle}>{c.containerNo}</td>
                    {isThirdParty && <td style={tdStyle}>{c.tpInvoiceNo || '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.tpInvoiceDate || '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.tpInvoiceValue || '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.basicValue || '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.cgst ?? '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.sgst ?? '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.igst ?? '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.tpVendorCode || '-'}</td>}
                    {isThirdParty && <td style={tdStyle}>{c.tpVendorName || '-'}</td>}
                    {!isThirdParty && <td style={tdStyle}>{c.rate}</td>}
                    {!isThirdParty && <td style={tdStyle}>{c.currency}</td>}
                    <td style={tdStyle}>
                      <button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>&#128196;</button>
                    </td>
                    {/* Remarks column */}
                    <td style={tdStyle}>
                      {c.remark ? (
                        <span
                          onClick={() => setExpandedRemarkId(expandedRemarkId === c.id ? null : c.id)}
                          style={{ cursor: 'pointer', fontSize: 10, color: '#006EC3', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                          title={c.remark}
                        >
                          {expandedRemarkId === c.id ? c.remark : truncateRemark(c.remark)}
                        </span>
                      ) : <span style={{ color: '#bbb', fontSize: 10 }}>—</span>}
                    </td>
                    {/* Action column */}
                    <td style={tdStyle}>
                      {c.action ? (
                        <span style={{
                          padding: '4px 10px', borderRadius: 3, fontSize: 10, fontWeight: 600,
                          background: c.action === 'Approved' ? '#D3FFEA' : '#FFD3D3',
                          color: c.action === 'Approved' ? '#0F6E3C' : '#A00',
                        }}>
                          {c.action}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button style={actionBtn('#D3FFEA')} onClick={() => handleAction(idx, 'Approved')}>Approve</button>
                          <button style={actionBtn('#FFD3D3')} onClick={() => handleAction(idx, 'Rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {popup && (
          <RemarkPopup action={popup.action} onOk={handlePopupOk} onCancel={() => setPopup(null)} />
        )}
      </td>
    </tr>
  );
};

// ════════════════════════════════════════════════════
// Main Approver Screen
// ════════════════════════════════════════════════════

interface ApproverScreenProps {
  onOpenMenu: () => void;
}

const ApproverScreen: React.FC<ApproverScreenProps> = ({ onOpenMenu }) => {
  const [claims, setClaims] = useState(DEMO_CLAIMS);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [filterBusiness, setFilterBusiness] = useState('All');
  const [filterVendorType, setFilterVendorType] = useState('All');
  const [filterASN, setFilterASN] = useState('All');
  const [filterVendorCode, setFilterVendorCode] = useState('All');
  const [filterWorkflowId, setFilterWorkflowId] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const vendorCodeOptions = useMemo(() => {
    if (filterVendorType === 'All') return [];
    return VENDOR_CODES_BY_TYPE[filterVendorType] || [];
  }, [filterVendorType]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (filterBusiness !== 'All' && c.business !== filterBusiness) return false;
      if (filterVendorType !== 'All' && c.vendorType !== filterVendorType) return false;
      if (filterASN !== 'All' && c.asnNo !== filterASN) return false;
      if (filterVendorType !== 'All' && filterVendorCode !== 'All' && c.vendorCode !== filterVendorCode) return false;
      if (filterWorkflowId !== 'All' && c.workflowId !== filterWorkflowId) return false;
      return true;
    });
  }, [claims, filterBusiness, filterVendorType, filterASN, filterVendorCode, filterWorkflowId]);

  const handleUpdateClaim = (updated: ClaimRow) => {
    setClaims(prev => prev.map(c => c.claimId === updated.claimId ? updated : c));
  };

  const handleReset = () => {
    setFilterBusiness('All');
    setFilterVendorType('All');
    setFilterASN('All');
    setFilterVendorCode('All');
    setFilterWorkflowId('All');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const selectStyle: React.CSSProperties = {
    height: 30, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 11,
    padding: '0 8px', fontFamily: 'inherit', minWidth: 130, outline: 'none',
  };

  const inputStyle: React.CSSProperties = {
    height: 30, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 11,
    padding: '0 8px', fontFamily: 'inherit', minWidth: 120, outline: 'none',
  };

  return (
    <div style={{ background: '#F1EEE7', minHeight: '100vh', fontFamily: "'Open Sans', system-ui, sans-serif" }}>
      {/* Navbar */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px', borderBottom: '1px solid #F7F7F7', background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span onClick={onOpenMenu} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="#333">
              <rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="13" y="1" width="4" height="4" rx="0.5"/>
              <rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/><rect x="13" y="7" width="4" height="4" rx="0.5"/>
              <rect x="1" y="13" width="4" height="4" rx="0.5"/><rect x="7" y="13" width="4" height="4" rx="0.5"/><rect x="13" y="13" width="4" height="4" rx="0.5"/>
            </svg>
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>Additional Charges Approval</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ position: 'relative', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute', top: -6, right: -8,
              background: '#f5222d', color: '#fff', fontSize: 9, fontWeight: 700,
              borderRadius: 8, padding: '1px 4px', lineHeight: '12px',
            }}>99+</span>
          </span>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', background: '#7B61FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>P</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', padding: '16px 20px', margin: '8px 10px 0', borderRadius: '4px 4px 0 0',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Business</div>
            <select style={selectStyle} value={filterBusiness} onChange={e => setFilterBusiness(e.target.value)}>
              {BUSINESS_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Vendor Type</div>
            <select style={selectStyle} value={filterVendorType} onChange={e => { setFilterVendorType(e.target.value); setFilterVendorCode('All'); }}>
              {VENDOR_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          {filterVendorType !== 'All' && (
            <div>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Vendor Code &amp; Name</div>
              <select style={{ ...selectStyle, minWidth: 180 }} value={filterVendorCode} onChange={e => setFilterVendorCode(e.target.value)}>
                <option value="All">All</option>
                {vendorCodeOptions.map(v => (
                  <option key={v.code} value={v.code}>{v.code} — {v.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>ASN No</div>
            <select style={selectStyle} value={filterASN} onChange={e => setFilterASN(e.target.value)}>
              {ASN_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Workflow ID</div>
            <select style={selectStyle} value={filterWorkflowId} onChange={e => setFilterWorkflowId(e.target.value)}>
              {WORKFLOW_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Date From</div>
            <input
              type="date"
              style={inputStyle}
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Date To</div>
            <input
              type="date"
              style={inputStyle}
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
            />
          </div>
          <button onClick={() => {}} style={{
            height: 30, padding: '0 20px', background: '#006EC3', color: '#fff',
            border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Search</button>
          <button onClick={handleReset} style={{
            height: 30, padding: '0 20px', background: '#fff', color: '#333',
            border: '1px solid #999', borderRadius: 4, fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Reset</button>
        </div>
      </div>

      {/* Claims table */}
      <div style={{
        background: '#fff', margin: '0 10px', padding: '0 20px 20px', overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>Claim ID</th>
              <th style={thStyle}>Vendor Type</th>
              <th style={thStyle}>Vendor Name</th>
              <th style={thStyle}>Vendor Code</th>
              <th style={thStyle}>Business</th>
              <th style={thStyle}>No. of Charges</th>
              <th style={thStyle}>Total Amount (INR)</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created Date/Time</th>
              <th style={thStyle}>Workflow ID</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map(c => (
              <React.Fragment key={c.claimId}>
                <tr style={{ background: expandedClaimId === c.claimId ? '#F0F7FF' : '#fff' }}>
                  <td style={tdStyle}>{c.claimId}</td>
                  <td style={tdStyle}>{c.vendorType}</td>
                  <td style={tdStyle}>{c.vendorName}</td>
                  <td style={tdStyle}>{c.vendorCode}</td>
                  <td style={tdStyle}>{c.business}</td>
                  <td style={tdStyle}>{c.chargesClaimed}</td>
                  <td style={tdStyle}>{c.totalAmount}</td>
                  <td style={{
                    ...tdStyle, fontWeight: 600, fontSize: 10,
                    color: c.status.includes('Approved') ? '#0F6E3C' : c.status.includes('Rejected') ? '#A00' : c.status === 'Done' ? '#0F6E3C' : '#1565C0',
                  }}>{c.status}</td>
                  <td style={tdStyle}>{c.createdAt}</td>
                  <td style={tdStyle}>{c.workflowId}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setExpandedClaimId(expandedClaimId === c.claimId ? null : c.claimId)}
                      style={{
                        color: '#006EC3', background: 'none', border: 'none',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        textDecoration: 'underline', fontFamily: 'inherit',
                      }}
                    >{expandedClaimId === c.claimId ? '[Close]' : '[Click for Approval]'}</button>
                  </td>
                </tr>
                {expandedClaimId === c.claimId && (
                  <InlineApprovalDetail
                    claim={c}
                    onClose={() => setExpandedClaimId(null)}
                    onUpdateClaim={handleUpdateClaim}
                  />
                )}
              </React.Fragment>
            ))}
            {filteredClaims.length === 0 && (
              <tr><td colSpan={11} style={{ ...tdStyle, textAlign: 'center', color: '#999', padding: 24 }}>No claims found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApproverScreen;
