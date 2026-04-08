import React, { useState, useMemo } from 'react';
import type { Bid } from '../data/bidData';
import InvoiceDocument, { generateIRN, generateAckNumber, numberToWords } from './InvoiceDocument';
import type { InvoiceData, InvoiceLineItem } from './InvoiceDocument';

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

interface ConfirmationChargeRow {
  id: string;
  chargeName: string;
  level: 'BL' | 'Container';
  vendorPrice: string;
  currency: string;
  unitType: string;
  units: string;
  tax: string;
  total: string;
}

interface TPChargeRow extends ConfirmationChargeRow {
  invoiceNo: string;
  invoiceDate: string;
  basicValue: string;
  cgst: string;
  sgst: string;
  igst: string;
  vendorCode: string;
  vendorName: string;
}

export interface InvoiceGenerationData {
  vendorType: string;
  vendorLabel: string;
  gpoBid: Bid | null;
  incidentalCharges: ConfirmationChargeRow[];
  selfReimbCharges: ConfirmationChargeRow[];
  thirdPartyCharges: TPChargeRow[];
}

interface Props {
  taskName: string;
  data: InvoiceGenerationData;
  onClose: () => void;
  onSubmit: () => void;
}

// ════════════════════════════════════════════════════
// Styles
// ════════════════════════════════════════════════════

const thStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#333',
  background: '#F0F0F0', borderBottom: '2px solid #DDD', textAlign: 'left', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 10px', fontSize: 12, borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle', color: '#333',
};
const fieldInputStyle: React.CSSProperties = {
  height: 32, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12,
  padding: '0 10px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' as const,
};
const totalRowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 12, alignItems: 'center',
};
const greyRowStyle: React.CSSProperties = { background: '#F0F0F0', opacity: 0.5, pointerEvents: 'none' as const };

// ════════════════════════════════════════════════════
// GPO bid → charge breakdown rows
// ════════════════════════════════════════════════════

const SKIP_KEYS = ['Bid ID', 'RFQ Plan', 'Destination Country', 'Cargo Type', 'Product', 'Incoterm', 'Rate Type', 'Total Freight', 'Total CHA Charges', 'Total CFS Charges', 'Total ICD Charges', 'Total Transport Cost', 'Total Survey Cost'];
const INFO_KEYS = ['Freight Forwarder', 'CHA Name', 'CFS Name', 'ICD Name', 'Transporter Name', 'Surveyor Name', 'Shipping Line', 'Carrier', 'Vendor Name'];
const DAYS_KEYS = ['Free Days (O)', 'Free Days (D)', 'Equipment Free Days (O)', 'Equipment Free Days (D)', 'CFS Free Days (D)', 'CFS Free Days', 'ICD Free Days'];

function gpoBidToRows(bid: Bid): ConfirmationChargeRow[] {
  const rows: ConfirmationChargeRow[] = [];
  let sno = 0;
  for (const [key, value] of Object.entries(bid.details)) {
    if (SKIP_KEYS.includes(key) || INFO_KEYS.includes(key) || DAYS_KEYS.includes(key)) continue;
    if (!value || value === '-' || value === 'USD 0' || value === '0') continue;
    sno++;
    const amtMatch = value.match(/(?:USD|INR)\s*([\d,.]+)/);
    const amt = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;
    rows.push({
      id: `gpo-${sno}`,
      chargeName: key,
      level: 'BL',
      vendorPrice: value,
      currency: bid.currency,
      unitType: 'Lumpsum',
      units: '1.00',
      tax: '—',
      total: amt > 0 ? amt.toFixed(2) : value,
    });
  }
  return rows;
}

// ════════════════════════════════════════════════════
// Total Row
// ════════════════════════════════════════════════════

const TotalRow: React.FC<{ total: number; currency: string }> = ({ total, currency }) => (
  <div style={totalRowStyle}>
    <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>Total:</span>
    <span style={{ background: '#F5F5F5', borderRadius: 4, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#333', border: '1px solid #E0E0E0' }}>
      {total.toFixed(2)} {currency}
    </span>
  </div>
);

// ════════════════════════════════════════════════════
// Generate Invoice Button (inline)
// ════════════════════════════════════════════════════

const GenBtn: React.FC<{ enabled: boolean; onClick: () => void }> = ({ enabled, onClick }) => (
  <button onClick={onClick} style={{
    height: 34, padding: '0 20px', background: enabled ? '#006EC3' : '#B0BEC5', color: '#fff',
    border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
    whiteSpace: 'nowrap', opacity: enabled ? 1 : 0.8,
  }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
    Generate Invoice
  </button>
);

// ════════════════════════════════════════════════════
// Doc Card
// ════════════════════════════════════════════════════

const DocCard: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <div onClick={onClick} style={{
    marginTop: 8, padding: '8px 14px', background: '#F0F7FF', border: '1px solid #BBDEFB',
    borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006EC3" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <span style={{ fontSize: 12, fontWeight: 600, color: '#006EC3' }}>{label}</span>
    <span style={{ fontSize: 10, color: '#999', marginLeft: 'auto' }}>Click to view</span>
  </div>
);

// ════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════

type TabKey = 'contractual' | 'self-reimb' | 'third-party';

const InvoiceGenerationView: React.FC<Props> = ({ taskName, data, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('contractual');

  // Invoice fields
  const [contractualInvNo, setContractualInvNo] = useState('');
  const [contractualInvDate, setContractualInvDate] = useState('');
  const [selfReimbInvNo, setSelfReimbInvNo] = useState('');
  const [selfReimbInvDate, setSelfReimbInvDate] = useState('');
  const [tpInvoiceFields, setTpInvoiceFields] = useState<Record<string, { invoiceNo: string; invoiceDate: string }>>({});

  // Unified checkbox state — contractual uses single set for all GPO + incidental rows
  const [checkedContractual, setCheckedContractual] = useState<Set<string>>(new Set());
  const [checkedSelfReimb, setCheckedSelfReimb] = useState<Set<string>>(new Set());
  const [checkedTP, setCheckedTP] = useState<Set<string>>(new Set());

  // Greyed out (already invoiced)
  const [greyedContractual, setGreyedContractual] = useState<Set<string>>(new Set());
  const [greyedSelfReimb, setGreyedSelfReimb] = useState<Set<string>>(new Set());
  const [greyedTP, setGreyedTP] = useState<Set<string>>(new Set());

  // Generated docs & loading
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<Array<{ id: string; label: string; invoice: InvoiceData }>>([]);
  const [showPopup, setShowPopup] = useState('');

  const handleTpFieldChange = (rowId: string, field: 'invoiceNo' | 'invoiceDate', value: string) => {
    setTpInvoiceFields(prev => ({ ...prev, [rowId]: { ...(prev[rowId] || { invoiceNo: '', invoiceDate: '' }), [field]: value } }));
  };

  const toggleSet = (set: Set<string>, id: string): Set<string> => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  // GPO rows + incidental = all contractual rows (flat list)
  const gpoRows = useMemo(() => data.gpoBid ? gpoBidToRows(data.gpoBid) : [], [data.gpoBid]);
  const allContractualRows = useMemo(() => [...gpoRows, ...data.incidentalCharges], [gpoRows, data.incidentalCharges]);
  const contractualTotal = allContractualRows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const selfReimbTotal = data.selfReimbCharges.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const tpTotal = data.thirdPartyCharges.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  // Select-all helpers
  const selectableContractual = allContractualRows.filter(r => !greyedContractual.has(r.id)).map(r => r.id);
  const allContractualChecked = selectableContractual.length > 0 && selectableContractual.every(id => checkedContractual.has(id));
  const toggleAllContractual = () => {
    if (allContractualChecked) setCheckedContractual(new Set());
    else setCheckedContractual(new Set(selectableContractual));
  };

  const selectableSelfReimb = data.selfReimbCharges.filter(r => !greyedSelfReimb.has(r.id)).map(r => r.id);
  const allSelfReimbChecked = selectableSelfReimb.length > 0 && selectableSelfReimb.every(id => checkedSelfReimb.has(id));
  const toggleAllSelfReimb = () => {
    if (allSelfReimbChecked) setCheckedSelfReimb(new Set());
    else setCheckedSelfReimb(new Set(selectableSelfReimb));
  };

  const seller = {
    name: data.vendorType === 'CHA' ? 'Sharaf Shipping Agency Pvt Ltd' : 'Eusu Logistics India Pvt Ltd',
    gstin: data.vendorType === 'CHA' ? '27AABCS4512K1ZD' : '27AACCE9129K1ZD',
    address: data.vendorType === 'CHA' ? 'Unit 501, Trade Centre, Bandra Kurla Complex, Mumbai 400051' : 'Tower B, 8th Floor, Parinee Crescenzo, G Block BKC, Mumbai 400098',
    email: data.vendorType === 'CHA' ? 'billing@sharafshipping.com' : 'invoices@eusulogistics.com',
  };
  const purchaser = { name: 'RELIANCE INDUSTRIES LIMITED', gstin: '24AAACR5055K1ZD', address: 'PO Motikhavdi, Jamnagar 361140, Gujarat', stateCode: '24' };

  const buildInvoice = (invoiceNo: string, invoiceDate: string, rows: Array<{ chargeName: string; vendorPrice: string; currency: string; unit: string; total: string; tax: string; cgst?: string; sgst?: string; igst?: string }>): InvoiceData => {
    const lineItems: InvoiceLineItem[] = rows.map((r, i) => ({
      sno: i + 1, chargeDetails: r.chargeName.split('\n')[0], hsnSac: '996719', currency: r.currency,
      rate: r.vendorPrice.replace(/[^0-9.]/g, '') || r.vendorPrice, unit: r.unit || '1.00',
      taxableAmt: parseFloat(r.vendorPrice.replace(/[^0-9.]/g, '') || r.total).toFixed(2),
      taxRate: r.tax || '18+0+0', cgst: r.cgst || '0.00', sgst: r.sgst || '0.00', igst: r.igst || '0.00',
      total: parseFloat(r.total).toFixed(2),
    }));
    const totalTaxable = lineItems.reduce((s, r) => s + parseFloat(r.taxableAmt), 0);
    const grandTotal = lineItems.reduce((s, r) => s + parseFloat(r.total), 0);
    const totalCgst = lineItems.reduce((s, r) => s + parseFloat(r.cgst), 0);
    const totalSgst = lineItems.reduce((s, r) => s + parseFloat(r.sgst), 0);
    const totalIgst = lineItems.reduce((s, r) => s + parseFloat(r.igst), 0);
    return {
      vendorType: data.vendorType, vendorName: seller.name, invoiceNumber: invoiceNo, invoiceDate,
      irn: generateIRN(), ackNumber: generateAckNumber(), seller, purchaser, lineItems,
      taxSummary: [{ hsnSac: '996719', taxableAmt: totalTaxable.toFixed(2), rate: '18%', cgst: totalCgst.toFixed(2), sgst: totalSgst.toFixed(2), igst: totalIgst.toFixed(2), total: grandTotal.toFixed(2) }],
      totalTaxable: totalTaxable.toFixed(2), totalTax: (totalCgst + totalSgst + totalIgst).toFixed(2),
      grandTotal: grandTotal.toFixed(2), grandTotalWords: numberToWords(Math.round(grandTotal)),
    };
  };

  // ── Generate handlers ──

  const handleGenerateContractual = () => {
    if (!contractualInvNo.trim() || !contractualInvDate.trim()) { setShowPopup('contractual'); return; }
    if (checkedContractual.size === 0) { setShowPopup('select'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const rows: Array<{ chargeName: string; vendorPrice: string; currency: string; unit: string; total: string; tax: string }> = [];
      checkedContractual.forEach(id => {
        const r = allContractualRows.find(c => c.id === id);
        if (r) rows.push({ chargeName: r.chargeName, vendorPrice: r.vendorPrice, currency: r.currency, unit: r.units, total: r.total, tax: r.tax });
      });
      const inv = buildInvoice(contractualInvNo, contractualInvDate, rows);
      setGeneratedDocs(prev => [...prev, { id: `con-${Date.now()}`, label: `Contractual — ${contractualInvNo}`, invoice: inv }]);
      setGreyedContractual(prev => new Set([...prev, ...checkedContractual]));
      setCheckedContractual(new Set());
      setContractualInvNo('');
      setContractualInvDate('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateSelfReimb = () => {
    if (!selfReimbInvNo.trim() || !selfReimbInvDate.trim()) { setShowPopup('selfreimb'); return; }
    if (checkedSelfReimb.size === 0) { setShowPopup('select'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const rows: Array<{ chargeName: string; vendorPrice: string; currency: string; unit: string; total: string; tax: string }> = [];
      checkedSelfReimb.forEach(id => {
        const r = data.selfReimbCharges.find(c => c.id === id);
        if (r) rows.push({ chargeName: r.chargeName, vendorPrice: r.vendorPrice, currency: r.currency, unit: r.units, total: r.total, tax: '' });
      });
      const inv = buildInvoice(selfReimbInvNo, selfReimbInvDate, rows);
      setGeneratedDocs(prev => [...prev, { id: `sr-${Date.now()}`, label: `Self-Reimb — ${selfReimbInvNo}`, invoice: inv }]);
      setGreyedSelfReimb(prev => new Set([...prev, ...checkedSelfReimb]));
      setCheckedSelfReimb(new Set());
      setSelfReimbInvNo('');
      setSelfReimbInvDate('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateTP = () => {
    // Check all checked rows have invoice fields
    let missing = false;
    checkedTP.forEach(id => {
      const f = tpInvoiceFields[id];
      if (!f || !f.invoiceNo.trim() || !f.invoiceDate.trim()) missing = true;
    });
    if (checkedTP.size === 0) { setShowPopup('select'); return; }
    if (missing) { setShowPopup('tp'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const newDocs = Array.from(checkedTP).map(id => {
        const r = data.thirdPartyCharges.find(c => c.id === id)!;
        const f = tpInvoiceFields[id];
        const inv = buildInvoice(f.invoiceNo, f.invoiceDate, [{
          chargeName: r.chargeName, vendorPrice: r.basicValue, currency: r.currency,
          unit: r.units, total: r.total, tax: '18% GST', cgst: r.cgst, sgst: r.sgst, igst: r.igst,
        }]);
        return { id: `tp-${id}-${Date.now()}`, label: `TP — ${r.chargeName} — ${f.invoiceNo}`, invoice: inv };
      });
      setGeneratedDocs(prev => [...prev, ...newDocs]);
      setGreyedTP(prev => new Set([...prev, ...checkedTP]));
      setCheckedTP(new Set());
      setIsGenerating(false);
    }, 2500);
  };

  const tabs: { key: TabKey; label: string; color: string; count: number }[] = [
    { key: 'contractual', label: 'Contractual Charges', color: '#E65100', count: gpoRows.length + data.incidentalCharges.length },
    { key: 'self-reimb', label: 'Self-Reimbursement Charges', color: '#1565C0', count: data.selfReimbCharges.length },
    { key: 'third-party', label: 'Third-Party Reimbursement Charges', color: '#2E7D32', count: data.thirdPartyCharges.length },
  ];

  return (
    <div className="task-detail">
      {/* Header */}
      <div className="task-detail-header">
        <div className="task-detail-header-left">
          <button className="task-detail-close" onClick={onClose}>&#10005;</button>
          <span className="task-detail-title">{taskName}</span>
          <span style={{ fontSize: 11, background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 3, fontWeight: 600 }}>{data.vendorType}</span>
          <span className="task-detail-deadline-wrap">
            <span className="task-detail-deadline-label">Deadline:</span>
            <span className="task-detail-deadline-value">30 Mar 2026</span>
          </span>
        </div>
        <div className="task-detail-actions">
          <button className="btn-submit" onClick={onSubmit}>Submit</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #e8e8e8', background: '#FAFAFA' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 16px', fontSize: 12, fontFamily: 'inherit', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === t.key ? `3px solid ${t.color}` : '3px solid transparent',
            color: activeTab === t.key ? t.color : '#666', fontWeight: activeTab === t.key ? 700 : 400,
          }}>
            {t.label}
            {t.count > 0 && <span style={{ marginLeft: 6, fontSize: 10, background: activeTab === t.key ? t.color : '#ccc', color: '#fff', borderRadius: 8, padding: '1px 6px' }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="task-detail-body" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>

        {/* ═══ CONTRACTUAL TAB ═══ */}
        {activeTab === 'contractual' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ ...thStyle, width: 30 }}><input type="checkbox" checked={allContractualChecked} onChange={toggleAllContractual} disabled={selectableContractual.length === 0} /></th>
                <th style={{ ...thStyle, width: 30 }}>#</th>
                <th style={thStyle}>Charges</th>
                <th style={thStyle}>Vendor's Price</th>
                <th style={thStyle}>Currency</th>
                <th style={thStyle}>Unit Type</th>
                <th style={thStyle}>Units</th>
                <th style={thStyle}>Tax</th>
                <th style={thStyle}>Total</th>
              </tr></thead>
              <tbody>
                {allContractualRows.map((r, i) => {
                  const greyed = greyedContractual.has(r.id);
                  return (
                    <tr key={r.id} style={greyed ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={tdStyle}><input type="checkbox" checked={checkedContractual.has(r.id)} disabled={greyed} onChange={() => setCheckedContractual(prev => toggleSet(prev, r.id))} /></td>
                      <td style={{ ...tdStyle, color: '#999', fontSize: 11 }}>{i + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{r.chargeName}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>{r.level === 'BL' ? 'BL Level' : 'Container Level'}</div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.vendorPrice}</td>
                      <td style={tdStyle}>{r.currency}</td>
                      <td style={tdStyle}>{r.unitType}</td>
                      <td style={tdStyle}>{r.units}</td>
                      <td style={tdStyle}>{r.tax}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{r.total} {r.currency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <TotalRow total={contractualTotal} currency={data.gpoBid?.currency || 'USD'} />

            {/* Invoice fields + generate */}
            <div style={{ display: 'flex', gap: 14, padding: '16px 0', marginTop: 12, borderTop: '1px dashed #d0d0d0', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, maxWidth: 240 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice No.</div>
                <input style={fieldInputStyle} placeholder="Enter invoice number" value={contractualInvNo} onChange={e => setContractualInvNo(e.target.value)} />
              </div>
              <div style={{ flex: 1, maxWidth: 190 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice Date</div>
                <input style={fieldInputStyle} type="date" value={contractualInvDate} onChange={e => setContractualInvDate(e.target.value)} />
              </div>
              <GenBtn enabled={contractualInvNo.trim() !== '' && contractualInvDate.trim() !== '' && checkedContractual.size > 0} onClick={handleGenerateContractual} />
            </div>
            {generatedDocs.filter(d => d.id.startsWith('con-')).map(d => <DocCard key={d.id} label={d.label} onClick={() => setViewingInvoice(d.invoice)} />)}
          </div>
        )}

        {/* ═══ SELF-REIMBURSEMENT TAB ═══ */}
        {activeTab === 'self-reimb' && (
          <div>
            {data.selfReimbCharges.length > 0 ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={{ ...thStyle, width: 30 }}><input type="checkbox" checked={allSelfReimbChecked} onChange={toggleAllSelfReimb} disabled={selectableSelfReimb.length === 0} /></th>
                    <th style={{ ...thStyle, width: 30 }}>#</th>
                    <th style={thStyle}>Charges</th>
                    <th style={thStyle}>Vendor's Price</th>
                    <th style={thStyle}>Currency</th>
                    <th style={thStyle}>Unit Type</th>
                    <th style={thStyle}>Units</th>
                    <th style={thStyle}>Total</th>
                  </tr></thead>
                  <tbody>
                    {data.selfReimbCharges.map((r, i) => {
                      const greyed = greyedSelfReimb.has(r.id);
                      return (
                        <tr key={r.id} style={greyed ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                          <td style={tdStyle}><input type="checkbox" checked={checkedSelfReimb.has(r.id)} disabled={greyed} onChange={() => setCheckedSelfReimb(prev => toggleSet(prev, r.id))} /></td>
                          <td style={{ ...tdStyle, color: '#999', fontSize: 11 }}>{i + 1}</td>
                          <td style={tdStyle}><div style={{ fontWeight: 600 }}>{r.chargeName}</div><div style={{ fontSize: 10, color: '#999' }}>{r.level === 'BL' ? 'BL Level' : 'Container Level'}</div></td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{r.vendorPrice}</td>
                          <td style={tdStyle}>{r.currency}</td>
                          <td style={tdStyle}>{r.unitType}</td>
                          <td style={tdStyle}>{r.units}</td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{r.total} {r.currency}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <TotalRow total={selfReimbTotal} currency={data.selfReimbCharges[0]?.currency || 'USD'} />
                <div style={{ display: 'flex', gap: 14, padding: '16px 0', marginTop: 12, borderTop: '1px dashed #d0d0d0', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, maxWidth: 240 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice No.</div>
                    <input style={fieldInputStyle} placeholder="Enter invoice number" value={selfReimbInvNo} onChange={e => setSelfReimbInvNo(e.target.value)} />
                  </div>
                  <div style={{ flex: 1, maxWidth: 190 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice Date</div>
                    <input style={fieldInputStyle} type="date" value={selfReimbInvDate} onChange={e => setSelfReimbInvDate(e.target.value)} />
                  </div>
                  <GenBtn enabled={selfReimbInvNo.trim() !== '' && selfReimbInvDate.trim() !== '' && checkedSelfReimb.size > 0} onClick={handleGenerateSelfReimb} />
                </div>
                {generatedDocs.filter(d => d.id.startsWith('sr-')).map(d => <DocCard key={d.id} label={d.label} onClick={() => setViewingInvoice(d.invoice)} />)}
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>No self-reimbursement charges for this vendor.</div>
            )}
          </div>
        )}

        {/* ═══ THIRD-PARTY TAB ═══ */}
        {activeTab === 'third-party' && (
          <div>
            {data.thirdPartyCharges.length > 0 ? (
              <>
                {data.thirdPartyCharges.map((r, i) => {
                  const greyed = greyedTP.has(r.id);
                  const fields = tpInvoiceFields[r.id] || { invoiceNo: '', invoiceDate: '' };
                  return (
                    <div key={r.id} style={{
                      border: '1px solid #E8E8E8', borderRadius: 6, marginBottom: 12, overflow: 'hidden',
                      ...(greyed ? { background: '#F0F0F0', opacity: 0.5, pointerEvents: 'none' as const } : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }),
                    }}>
                      <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '4px 20px', alignItems: 'center' }}>
                        <input type="checkbox" checked={checkedTP.has(r.id)} disabled={greyed} onChange={() => setCheckedTP(prev => toggleSet(prev, r.id))} />
                        <div style={{ minWidth: 30, color: '#999', fontSize: 11, fontWeight: 600 }}>#{i + 1}</div>
                        <div style={{ minWidth: 160 }}>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{r.chargeName}</div>
                          <div style={{ fontSize: 10, color: '#999' }}>Container Level</div>
                        </div>
                        <div style={{ minWidth: 80 }}><div style={{ fontSize: 10, color: '#999' }}>Basic Value</div><div style={{ fontSize: 12, fontWeight: 600 }}>{r.basicValue}</div></div>
                        <div style={{ minWidth: 55 }}><div style={{ fontSize: 10, color: '#999' }}>CGST</div><div style={{ fontSize: 11, color: '#666' }}>{r.cgst || '—'}</div></div>
                        <div style={{ minWidth: 55 }}><div style={{ fontSize: 10, color: '#999' }}>SGST</div><div style={{ fontSize: 11, color: '#666' }}>{r.sgst || '—'}</div></div>
                        <div style={{ minWidth: 55 }}><div style={{ fontSize: 10, color: '#999' }}>IGST</div><div style={{ fontSize: 11, color: '#666' }}>{r.igst || '—'}</div></div>
                        <div style={{ minWidth: 80 }}><div style={{ fontSize: 10, color: '#999' }}>Vendor</div><div style={{ fontSize: 11, color: '#666' }}>{r.vendorCode}</div></div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: 10, color: '#999' }}>Total</div><div style={{ fontSize: 13, fontWeight: 700 }}>{r.total} {r.currency}</div></div>
                      </div>
                      <div style={{ padding: '8px 14px 10px', background: '#F5F8FF', borderTop: '1px dashed #d0d0d0', display: 'flex', gap: 14, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, maxWidth: 240 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', marginBottom: 3 }}>{data.vendorLabel} Invoice No.</div>
                          <input style={fieldInputStyle} placeholder="Invoice No." value={fields.invoiceNo} onChange={e => handleTpFieldChange(r.id, 'invoiceNo', e.target.value)} />
                        </div>
                        <div style={{ flex: 1, maxWidth: 190 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', marginBottom: 3 }}>{data.vendorLabel} Invoice Date</div>
                          <input style={fieldInputStyle} type="date" value={fields.invoiceDate} onChange={e => handleTpFieldChange(r.id, 'invoiceDate', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <TotalRow total={tpTotal} currency={data.thirdPartyCharges[0]?.currency || 'USD'} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <GenBtn enabled={checkedTP.size > 0} onClick={handleGenerateTP} />
                </div>
                {generatedDocs.filter(d => d.id.startsWith('tp-')).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 6 }}>Generated Invoices:</div>
                    {generatedDocs.filter(d => d.id.startsWith('tp-')).map(d => <DocCard key={d.id} label={d.label} onClick={() => setViewingInvoice(d.invoice)} />)}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>No third-party reimbursement charges for this vendor.</div>
            )}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isGenerating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#006EC3" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>Generating Invoice...</div>
          <div style={{ fontSize: 11, color: '#999' }}>Preparing document with IRN and QR code</div>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>&#9888;</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 8 }}>
              {showPopup === 'select' ? 'No Items Selected' : 'Missing Details'}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
              {showPopup === 'select'
                ? 'Please select at least one charge item using the checkbox before generating an invoice.'
                : `Please fill in the invoice number and date fields before generating.`}
            </div>
            <button onClick={() => setShowPopup('')} style={{ height: 32, padding: '0 24px', background: '#006EC3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>OK</button>
          </div>
        </div>
      )}

      {/* Invoice Document Overlay */}
      {viewingInvoice && <InvoiceDocument data={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
    </div>
  );
};

export default InvoiceGenerationView;
