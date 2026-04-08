import React, { useState, useMemo, useEffect } from 'react';
import type { Bid } from '../data/bidData';
import InvoiceDocument, { generateIRN, generateAckNumber, numberToWords } from './InvoiceDocument';
import type { InvoiceData, InvoiceLineItem } from './InvoiceDocument';

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

interface ChargeRow {
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

interface TPChargeRow extends ChargeRow {
  invoiceNo: string;
  invoiceDate: string;
  basicValue: string;
  cgst: string;
  sgst: string;
  igst: string;
  vendorCode: string;
  vendorName: string;
}

export interface ChargeInvoiceData {
  vendorType: string;
  vendorLabel: string;
  gpoBid: Bid | null;
  incidentalCharges: ChargeRow[];
  selfReimbCharges: ChargeRow[];
  thirdPartyCharges: TPChargeRow[];
}

interface Props {
  taskName: string;
  data: ChargeInvoiceData;
  onClose: () => void;
  onSubmit: () => void;
  onStatusChange?: (status: 'Not Started' | 'Pending' | 'Done') => void;
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
// GPO bid → charge rows
// ════════════════════════════════════════════════════

const SKIP = ['Bid ID', 'RFQ Plan', 'Destination Country', 'Cargo Type', 'Product', 'Incoterm', 'Rate Type', 'Total Freight', 'Total CHA Charges', 'Total CFS Charges', 'Total ICD Charges', 'Total Transport Cost', 'Total Survey Cost'];
const INFO = ['Freight Forwarder', 'CHA Name', 'CFS Name', 'ICD Name', 'Transporter Name', 'Surveyor Name', 'Shipping Line', 'Carrier', 'Vendor Name'];
const DAYS = ['Free Days (O)', 'Free Days (D)', 'Equipment Free Days (O)', 'Equipment Free Days (D)', 'CFS Free Days (D)', 'CFS Free Days', 'ICD Free Days'];

function gpoBidToRows(bid: Bid): ChargeRow[] {
  const rows: ChargeRow[] = [];
  let n = 0;
  for (const [k, v] of Object.entries(bid.details)) {
    if (SKIP.includes(k) || INFO.includes(k) || DAYS.includes(k)) continue;
    if (!v || v === '-' || v === 'USD 0' || v === '0') continue;
    n++;
    const m = v.match(/(?:USD|INR)\s*([\d,.]+)/);
    const amt = m ? parseFloat(m[1].replace(/,/g, '')) : 0;
    const priceNum = amt > 0 ? amt.toFixed(2) : v.replace(/[A-Z]{3}\s*/g, '').trim();
    rows.push({ id: `gpo-${n}`, chargeName: k, level: 'BL', vendorPrice: priceNum, currency: bid.currency, unitType: 'Per BL', units: '1.00', tax: '—', total: amt > 0 ? amt.toFixed(2) : v });
  }
  return rows;
}

// ════════════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════════════

const TotalRow: React.FC<{ total: number; currency: string }> = ({ total, currency }) => (
  <div style={totalRowStyle}>
    <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>Total:</span>
    <span style={{ background: '#F5F5F5', borderRadius: 4, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#333', border: '1px solid #E0E0E0' }}>
      {total.toFixed(2)} {currency}
    </span>
  </div>
);

const GenBtn: React.FC<{ enabled: boolean; onClick: () => void }> = ({ enabled, onClick }) => (
  <button onClick={onClick} style={{
    height: 34, padding: '0 20px', background: enabled ? '#006EC3' : '#B0BEC5', color: '#fff',
    border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
    Generate Invoice
  </button>
);

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

const ChargeInvoiceView: React.FC<Props> = ({ taskName, data, onClose, onSubmit, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('contractual');

  const [contractualInvNo, setContractualInvNo] = useState('');
  const [contractualInvDate, setContractualInvDate] = useState('');
  const [selfReimbInvNo, setSelfReimbInvNo] = useState('');
  const [selfReimbInvDate, setSelfReimbInvDate] = useState('');
  const [tpInvoiceFields, setTpInvoiceFields] = useState<Record<string, { invoiceNo: string; invoiceDate: string }>>({});

  const [checkedContractual, setCheckedContractual] = useState<Set<string>>(new Set());
  const [checkedSelfReimb, setCheckedSelfReimb] = useState<Set<string>>(new Set());
  const [checkedTP, setCheckedTP] = useState<Set<string>>(new Set());

  const [greyedContractual, setGreyedContractual] = useState<Set<string>>(new Set());
  const [greyedSelfReimb, setGreyedSelfReimb] = useState<Set<string>>(new Set());
  const [greyedTP, setGreyedTP] = useState<Set<string>>(new Set());

  const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<Array<{ id: string; label: string; invoice: InvoiceData }>>([]);
  const [showPopup, setShowPopup] = useState('');

  const toggleSet = (set: Set<string>, id: string): Set<string> => {
    const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); return n;
  };
  const handleTpFieldChange = (rowId: string, field: 'invoiceNo' | 'invoiceDate', value: string) => {
    setTpInvoiceFields(prev => ({ ...prev, [rowId]: { ...(prev[rowId] || { invoiceNo: '', invoiceDate: '' }), [field]: value } }));
  };

  // Data
  const gpoRows = useMemo(() => data.gpoBid ? gpoBidToRows(data.gpoBid) : [], [data.gpoBid]);
  const allContractualRows = useMemo(() => [...gpoRows, ...data.incidentalCharges], [gpoRows, data.incidentalCharges]);
  const contractualTotal = allContractualRows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const selfReimbTotal = data.selfReimbCharges.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const tpTotal = data.thirdPartyCharges.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  // Select-all
  const selectableC = allContractualRows.filter(r => !greyedContractual.has(r.id)).map(r => r.id);
  const allCChecked = selectableC.length > 0 && selectableC.every(id => checkedContractual.has(id));
  const toggleAllC = () => allCChecked ? setCheckedContractual(new Set()) : setCheckedContractual(new Set(selectableC));

  const selectableSR = data.selfReimbCharges.filter(r => !greyedSelfReimb.has(r.id)).map(r => r.id);
  const allSRChecked = selectableSR.length > 0 && selectableSR.every(id => checkedSelfReimb.has(id));
  const toggleAllSR = () => allSRChecked ? setCheckedSelfReimb(new Set()) : setCheckedSelfReimb(new Set(selectableSR));

  // Auto-status: check if all rows across all tabs are greyed
  const allGreyed = useMemo(() => {
    const allCGreyed = allContractualRows.every(r => greyedContractual.has(r.id));
    const allSRGreyed = data.selfReimbCharges.length === 0 || data.selfReimbCharges.every(r => greyedSelfReimb.has(r.id));
    const allTPGreyed = data.thirdPartyCharges.length === 0 || data.thirdPartyCharges.every(r => greyedTP.has(r.id));
    return allCGreyed && allSRGreyed && allTPGreyed;
  }, [allContractualRows, data.selfReimbCharges, data.thirdPartyCharges, greyedContractual, greyedSelfReimb, greyedTP]);

  const anyGreyed = greyedContractual.size > 0 || greyedSelfReimb.size > 0 || greyedTP.size > 0;

  useEffect(() => {
    if (allGreyed && generatedDocs.length > 0) {
      onStatusChange?.('Done');
      // Auto-submit after a short delay
      const t = setTimeout(() => onSubmit(), 500);
      return () => clearTimeout(t);
    } else if (anyGreyed) {
      onStatusChange?.('Pending');
    }
  }, [allGreyed, anyGreyed, generatedDocs.length]);

  // Invoice builder
  const seller = {
    name: data.vendorType === 'CHA' ? 'Sharaf Shipping Agency Pvt Ltd' : 'Eusu Logistics India Pvt Ltd',
    gstin: data.vendorType === 'CHA' ? '27AABCS4512K1ZD' : '27AACCE9129K1ZD',
    address: data.vendorType === 'CHA' ? 'Unit 501, Trade Centre, BKC, Mumbai 400051' : 'Tower B, 8th Floor, Parinee Crescenzo, BKC, Mumbai 400098',
    email: data.vendorType === 'CHA' ? 'billing@sharafshipping.com' : 'invoices@eusulogistics.com',
  };
  const purchaser = { name: 'RELIANCE INDUSTRIES LIMITED', gstin: '24AAACR5055K1ZD', address: 'PO Motikhavdi, Jamnagar 361140, Gujarat', stateCode: '24' };

  const buildInvoice = (invoiceNo: string, invoiceDate: string, rows: Array<{ chargeName: string; vendorPrice: string; currency: string; unit: string; total: string; tax: string; cgst?: string; sgst?: string; igst?: string }>): InvoiceData => {
    const lineItems: InvoiceLineItem[] = rows.map((r, i) => ({
      sno: i + 1, chargeDetails: r.chargeName, hsnSac: '996719', currency: r.currency,
      rate: r.vendorPrice.replace(/[^0-9.]/g, '') || r.vendorPrice, unit: r.unit || '1.00',
      taxableAmt: parseFloat(r.vendorPrice.replace(/[^0-9.]/g, '') || r.total).toFixed(2),
      taxRate: r.tax || '18+0+0', cgst: r.cgst || '0.00', sgst: r.sgst || '0.00', igst: r.igst || '0.00',
      total: parseFloat(r.total).toFixed(2),
    }));
    const tTax = lineItems.reduce((s, r) => s + parseFloat(r.taxableAmt), 0);
    const gT = lineItems.reduce((s, r) => s + parseFloat(r.total), 0);
    const tc = lineItems.reduce((s, r) => s + parseFloat(r.cgst), 0);
    const ts = lineItems.reduce((s, r) => s + parseFloat(r.sgst), 0);
    const ti = lineItems.reduce((s, r) => s + parseFloat(r.igst), 0);
    return {
      vendorType: data.vendorType, vendorName: seller.name, invoiceNumber: invoiceNo, invoiceDate,
      irn: generateIRN(), ackNumber: generateAckNumber(), seller, purchaser, lineItems,
      taxSummary: [{ hsnSac: '996719', taxableAmt: tTax.toFixed(2), rate: '18%', cgst: tc.toFixed(2), sgst: ts.toFixed(2), igst: ti.toFixed(2), total: gT.toFixed(2) }],
      totalTaxable: tTax.toFixed(2), totalTax: (tc + ts + ti).toFixed(2),
      grandTotal: gT.toFixed(2), grandTotalWords: numberToWords(Math.round(gT)),
    };
  };

  // Generate handlers
  const handleGenContractual = () => {
    if (!contractualInvNo.trim() || !contractualInvDate.trim()) { setShowPopup('fields'); return; }
    if (checkedContractual.size === 0) { setShowPopup('select'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const rows = Array.from(checkedContractual).map(id => allContractualRows.find(c => c.id === id)!).filter(Boolean)
        .map(r => ({ chargeName: r.chargeName, vendorPrice: r.vendorPrice, currency: r.currency, unit: r.units, total: r.total, tax: r.tax }));
      const inv = buildInvoice(contractualInvNo, contractualInvDate, rows);
      setGeneratedDocs(prev => [...prev, { id: `con-${Date.now()}`, label: `Contractual — ${contractualInvNo}`, invoice: inv }]);
      setGreyedContractual(prev => new Set([...prev, ...checkedContractual]));
      setCheckedContractual(new Set()); setContractualInvNo(''); setContractualInvDate('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenSelfReimb = () => {
    if (!selfReimbInvNo.trim() || !selfReimbInvDate.trim()) { setShowPopup('fields'); return; }
    if (checkedSelfReimb.size === 0) { setShowPopup('select'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const rows = Array.from(checkedSelfReimb).map(id => data.selfReimbCharges.find(c => c.id === id)!).filter(Boolean)
        .map(r => ({ chargeName: r.chargeName, vendorPrice: r.vendorPrice, currency: r.currency, unit: r.units, total: r.total, tax: '' }));
      const inv = buildInvoice(selfReimbInvNo, selfReimbInvDate, rows);
      setGeneratedDocs(prev => [...prev, { id: `sr-${Date.now()}`, label: `Self-Reimb — ${selfReimbInvNo}`, invoice: inv }]);
      setGreyedSelfReimb(prev => new Set([...prev, ...checkedSelfReimb]));
      setCheckedSelfReimb(new Set()); setSelfReimbInvNo(''); setSelfReimbInvDate('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenTP = () => {
    if (checkedTP.size === 0) { setShowPopup('select'); return; }
    let missing = false;
    checkedTP.forEach(id => { const f = tpInvoiceFields[id]; if (!f || !f.invoiceNo.trim() || !f.invoiceDate.trim()) missing = true; });
    if (missing) { setShowPopup('fields'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const newDocs = Array.from(checkedTP).map(id => {
        const r = data.thirdPartyCharges.find(c => c.id === id)!;
        const f = tpInvoiceFields[id];
        const inv = buildInvoice(f.invoiceNo, f.invoiceDate, [{ chargeName: r.chargeName, vendorPrice: r.basicValue, currency: r.currency, unit: r.units, total: r.total, tax: '18% GST', cgst: r.cgst, sgst: r.sgst, igst: r.igst }]);
        return { id: `tp-${id}-${Date.now()}`, label: `TP — ${r.chargeName} — ${f.invoiceNo}`, invoice: inv };
      });
      setGeneratedDocs(prev => [...prev, ...newDocs]);
      setGreyedTP(prev => new Set([...prev, ...checkedTP]));
      setCheckedTP(new Set());
      setIsGenerating(false);
    }, 2500);
  };

  const tabs: { key: TabKey; label: string; color: string; count: number }[] = [
    { key: 'contractual', label: 'Contractual & Incidental Charges', color: '#E65100', count: allContractualRows.length },
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
          {anyGreyed && !allGreyed && <span style={{ fontSize: 10, background: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: 3, fontWeight: 600, marginLeft: 4 }}>Pending</span>}
          {allGreyed && <span style={{ fontSize: 10, background: '#D3FFEA', color: '#0F6E3C', padding: '2px 8px', borderRadius: 3, fontWeight: 600, marginLeft: 4 }}>All Invoiced</span>}
          <span className="task-detail-deadline-wrap">
            <span className="task-detail-deadline-label">Deadline:</span>
            <span className="task-detail-deadline-value">30 Mar 2026</span>
          </span>
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

        {/* ═══ CONTRACTUAL ═══ */}
        {activeTab === 'contractual' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ ...thStyle, width: 30 }}><input type="checkbox" checked={allCChecked} onChange={toggleAllC} disabled={selectableC.length === 0} /></th>
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
                  const g = greyedContractual.has(r.id);
                  return (
                    <tr key={r.id} style={g ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={tdStyle}><input type="checkbox" checked={checkedContractual.has(r.id)} disabled={g} onChange={() => setCheckedContractual(prev => toggleSet(prev, r.id))} /></td>
                      <td style={{ ...tdStyle, color: '#999', fontSize: 11 }}>{i + 1}</td>
                      <td style={tdStyle}><div style={{ fontWeight: 600 }}>{r.chargeName}</div><div style={{ fontSize: 10, color: '#999' }}>{r.level === 'BL' ? 'BL Level' : 'Container Level'}</div></td>
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
            <div style={{ display: 'flex', gap: 14, padding: '16px 0', marginTop: 12, borderTop: '1px dashed #d0d0d0', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, maxWidth: 240 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice No.</div>
                <input style={fieldInputStyle} placeholder="Enter invoice number" value={contractualInvNo} onChange={e => setContractualInvNo(e.target.value)} />
              </div>
              <div style={{ flex: 1, maxWidth: 190 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice Date</div>
                <input style={fieldInputStyle} type="date" value={contractualInvDate} onChange={e => setContractualInvDate(e.target.value)} />
              </div>
              <GenBtn enabled={contractualInvNo.trim() !== '' && contractualInvDate.trim() !== '' && checkedContractual.size > 0} onClick={handleGenContractual} />
            </div>
            {generatedDocs.filter(d => d.id.startsWith('con-')).map(d => <DocCard key={d.id} label={d.label} onClick={() => setViewingInvoice(d.invoice)} />)}
          </div>
        )}

        {/* ═══ SELF-REIMBURSEMENT ═══ */}
        {activeTab === 'self-reimb' && (
          <div>
            {data.selfReimbCharges.length > 0 ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={{ ...thStyle, width: 30 }}><input type="checkbox" checked={allSRChecked} onChange={toggleAllSR} disabled={selectableSR.length === 0} /></th>
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
                      const g = greyedSelfReimb.has(r.id);
                      return (
                        <tr key={r.id} style={g ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                          <td style={tdStyle}><input type="checkbox" checked={checkedSelfReimb.has(r.id)} disabled={g} onChange={() => setCheckedSelfReimb(prev => toggleSet(prev, r.id))} /></td>
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
                <TotalRow total={selfReimbTotal} currency={data.selfReimbCharges[0]?.currency || 'INR'} />
                <div style={{ display: 'flex', gap: 14, padding: '16px 0', marginTop: 12, borderTop: '1px dashed #d0d0d0', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, maxWidth: 240 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice No.</div>
                    <input style={fieldInputStyle} placeholder="Enter invoice number" value={selfReimbInvNo} onChange={e => setSelfReimbInvNo(e.target.value)} />
                  </div>
                  <div style={{ flex: 1, maxWidth: 190 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>{data.vendorLabel} Invoice Date</div>
                    <input style={fieldInputStyle} type="date" value={selfReimbInvDate} onChange={e => setSelfReimbInvDate(e.target.value)} />
                  </div>
                  <GenBtn enabled={selfReimbInvNo.trim() !== '' && selfReimbInvDate.trim() !== '' && checkedSelfReimb.size > 0} onClick={handleGenSelfReimb} />
                </div>
                {generatedDocs.filter(d => d.id.startsWith('sr-')).map(d => <DocCard key={d.id} label={d.label} onClick={() => setViewingInvoice(d.invoice)} />)}
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>No self-reimbursement charges for this vendor.</div>
            )}
          </div>
        )}

        {/* ═══ THIRD-PARTY ═══ */}
        {activeTab === 'third-party' && (
          <div>
            {data.thirdPartyCharges.length > 0 ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={{ ...thStyle, width: 30 }}>☐</th>
                    <th style={{ ...thStyle, width: 30 }}>#</th>
                    <th style={thStyle}>Charges</th>
                    <th style={thStyle}>Invoice No.</th>
                    <th style={thStyle}>Invoice Date</th>
                    <th style={thStyle}>Basic Value</th>
                    <th style={thStyle}>CGST</th>
                    <th style={thStyle}>SGST</th>
                    <th style={thStyle}>IGST</th>
                    <th style={thStyle}>Vendor Code</th>
                    <th style={thStyle}>Vendor Name</th>
                    <th style={thStyle}>Total</th>
                  </tr></thead>
                  <tbody>
                    {data.thirdPartyCharges.map((r, i) => {
                      const g = greyedTP.has(r.id);
                      const fields = tpInvoiceFields[r.id] || { invoiceNo: '', invoiceDate: '' };
                      return (
                        <React.Fragment key={r.id}>
                          <tr style={g ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                            <td style={tdStyle}><input type="checkbox" checked={checkedTP.has(r.id)} disabled={g} onChange={() => setCheckedTP(prev => toggleSet(prev, r.id))} /></td>
                            <td style={{ ...tdStyle, color: '#999', fontSize: 11 }}>{i + 1}</td>
                            <td style={tdStyle}><div style={{ fontWeight: 600 }}>{r.chargeName}</div><div style={{ fontSize: 10, color: '#999' }}>{r.level === 'BL' ? 'BL Level' : 'Container Level'}</div></td>
                            <td style={tdStyle}>{r.invoiceNo}</td>
                            <td style={tdStyle}>{r.invoiceDate}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{r.basicValue}</td>
                            <td style={{ ...tdStyle, fontSize: 11, color: '#666' }}>{r.cgst || '—'}</td>
                            <td style={{ ...tdStyle, fontSize: 11, color: '#666' }}>{r.sgst || '—'}</td>
                            <td style={{ ...tdStyle, fontSize: 11, color: '#666' }}>{r.igst || '—'}</td>
                            <td style={tdStyle}>{r.vendorCode}</td>
                            <td style={{ ...tdStyle, fontSize: 11, color: '#666' }}>{r.vendorName}</td>
                            <td style={{ ...tdStyle, fontWeight: 700 }}>{r.total} {r.currency}</td>
                          </tr>
                          {/* Invoice fields below row */}
                          {!g && (
                            <tr style={{ background: '#F5F8FF' }}>
                              <td colSpan={12} style={{ padding: '6px 14px 10px', borderBottom: '2px solid #E8E8E8' }}>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
                                  <div style={{ flex: 1, maxWidth: 220 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#333', marginBottom: 3 }}>{data.vendorLabel} Invoice No.</div>
                                    <input style={fieldInputStyle} placeholder="Invoice No." value={fields.invoiceNo} onChange={e => handleTpFieldChange(r.id, 'invoiceNo', e.target.value)} />
                                  </div>
                                  <div style={{ flex: 1, maxWidth: 180 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#333', marginBottom: 3 }}>{data.vendorLabel} Invoice Date</div>
                                    <input style={fieldInputStyle} type="date" value={fields.invoiceDate} onChange={e => handleTpFieldChange(r.id, 'invoiceDate', e.target.value)} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                <TotalRow total={tpTotal} currency={data.thirdPartyCharges[0]?.currency || 'INR'} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <GenBtn enabled={checkedTP.size > 0} onClick={handleGenTP} />
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

      {/* Loading */}
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 8 }}>{showPopup === 'select' ? 'No Items Selected' : 'Missing Details'}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
              {showPopup === 'select' ? 'Please select at least one charge item before generating.' : 'Please fill in all invoice number and date fields before generating.'}
            </div>
            <button onClick={() => setShowPopup('')} style={{ height: 32, padding: '0 24px', background: '#006EC3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>OK</button>
          </div>
        </div>
      )}

      {viewingInvoice && <InvoiceDocument data={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
    </div>
  );
};

export type { TPChargeRow };
export default ChargeInvoiceView;
