import React, { useState, useMemo } from 'react';
import type { Bid } from '../data/bidData';

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

export interface ChargeConfirmationData {
  vendorType: string;
  gpoBid: Bid | null;
  incidentalCharges: ConfirmationChargeRow[];
  selfReimbCharges: ConfirmationChargeRow[];
  thirdPartyCharges: TPChargeRow[];
}

interface Props {
  taskName: string;
  data: ChargeConfirmationData;
  onClose: () => void;
  onSubmit: () => void;
}

// ════════════════════════════════════════════════════
// Styles
// ════════════════════════════════════════════════════

const thStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#333',
  background: '#F0F0F0', borderBottom: '2px solid #DDD', textAlign: 'left',
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 10px', fontSize: 12, borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'middle', color: '#333',
};
const totalRowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 12, alignItems: 'center',
};

// ════════════════════════════════════════════════════
// GPO bid details → row items
// ════════════════════════════════════════════════════

const SKIP_KEYS = ['Bid ID', 'RFQ Plan', 'Destination Country', 'Cargo Type', 'Product', 'Incoterm', 'Rate Type', 'Total Freight', 'Total CHA Charges', 'Total CFS Charges', 'Total ICD Charges', 'Total Transport Cost', 'Total Survey Cost'];
const INFO_KEYS = ['Freight Forwarder', 'CHA Name', 'CFS Name', 'ICD Name', 'Transporter Name', 'Surveyor Name', 'Shipping Line', 'Carrier', 'Vendor Name'];
const DAYS_KEYS = ['Free Days (O)', 'Free Days (D)', 'Equipment Free Days (O)', 'Equipment Free Days (D)', 'CFS Free Days (D)', 'CFS Free Days', 'ICD Free Days'];

function gpoBidToRows(bid: Bid): ConfirmationChargeRow[] {
  const rows: ConfirmationChargeRow[] = [];
  let sno = 0;
  for (const [key, value] of Object.entries(bid.details)) {
    if (SKIP_KEYS.includes(key)) continue;
    if (INFO_KEYS.includes(key)) continue;
    if (DAYS_KEYS.includes(key)) continue;
    if (!value || value === '-' || value === 'USD 0' || value === '0') continue;
    sno++;
    // Parse USD amount from value like "USD 1500"
    const amtMatch = value.match(/(?:USD|INR)\s*([\d,.]+)/);
    const amt = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;
    const priceNum = amt > 0 ? amt.toFixed(2) : value.replace(/[A-Z]{3}\s*/g, '').trim();
    rows.push({
      id: `gpo-${sno}`,
      chargeName: key,
      level: 'BL',
      vendorPrice: priceNum,
      currency: bid.currency,
      unitType: 'Per BL',
      units: '1.00',
      tax: '—',
      total: amt > 0 ? amt.toFixed(2) : value,
    });
  }
  return rows;
}

// ════════════════════════════════════════════════════
// Charge Table (read-only, no Ref No.)
// ════════════════════════════════════════════════════

const ChargeTable: React.FC<{
  rows: ConfirmationChargeRow[];
  showTax?: boolean;
}> = ({ rows, showTax = true }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ ...thStyle, width: 30 }}>#</th>
        <th style={thStyle}>Charges</th>
        <th style={thStyle}>Vendor's Price</th>
        <th style={thStyle}>Currency</th>
        <th style={thStyle}>Unit Type</th>
        <th style={thStyle}>Units</th>
        {showTax && <th style={thStyle}>Tax</th>}
        <th style={thStyle}>Total</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
          <td style={{ ...tdStyle, color: '#999', fontSize: 11 }}>{i + 1}</td>
          <td style={tdStyle}>
            <div style={{ fontWeight: 600 }}>{r.chargeName}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{r.level === 'BL' ? 'BL Level' : 'Container Level'}</div>
          </td>
          <td style={{ ...tdStyle, fontWeight: 600 }}>{r.vendorPrice}</td>
          <td style={tdStyle}>{r.currency}</td>
          <td style={tdStyle}>{r.unitType}</td>
          <td style={tdStyle}>{r.units}</td>
          {showTax && <td style={tdStyle}>{r.tax}</td>}
          <td style={{ ...tdStyle, fontWeight: 700 }}>{r.total} {r.currency}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ════════════════════════════════════════════════════
// Third Party Charge Table (no Ref No.)
// ════════════════════════════════════════════════════

const ThirdPartyChargeTable: React.FC<{ rows: TPChargeRow[] }> = ({ rows }) => {
  const total = rows.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ ...tdStyle, color: '#999', fontSize: 11 }}>{i + 1}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{r.chargeName}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{r.level === 'BL' ? 'BL Level' : 'Container Level'}</div>
                </td>
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
            ))}
          </tbody>
        </table>
      </div>
      <div style={totalRowStyle}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>Total:</span>
        <span style={{ background: '#F5F5F5', borderRadius: 4, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#333', border: '1px solid #E0E0E0' }}>
          {total.toFixed(2)} {rows[0]?.currency || 'USD'}
        </span>
      </div>
    </div>
  );
};

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
// Main Component
// ════════════════════════════════════════════════════

type TabKey = 'contractual' | 'self-reimb' | 'third-party';

const ChargeConfirmationView: React.FC<Props> = ({ taskName, data, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('contractual');

  // Flat contractual rows: GPO + incidental
  const gpoRows = useMemo(() => data.gpoBid ? gpoBidToRows(data.gpoBid) : [], [data.gpoBid]);
  const allContractualRows = useMemo(() => [...gpoRows, ...data.incidentalCharges], [gpoRows, data.incidentalCharges]);
  const contractualTotal = allContractualRows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  const selfReimbTotal = data.selfReimbCharges.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  const tabs: { key: TabKey; label: string; color: string; count: number }[] = [
    { key: 'contractual', label: 'Contractual Charges', color: '#E65100', count: allContractualRows.length },
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
        {/* Contractual Tab */}
        {activeTab === 'contractual' && (
          <div>
            <ChargeTable rows={allContractualRows} />
            <TotalRow total={contractualTotal} currency={data.gpoBid?.currency || 'USD'} />
          </div>
        )}

        {/* Self-Reimbursement Tab */}
        {activeTab === 'self-reimb' && (
          <div>
            {data.selfReimbCharges.length > 0 ? (
              <>
                <ChargeTable rows={data.selfReimbCharges} showTax={false} />
                <TotalRow total={selfReimbTotal} currency={data.selfReimbCharges[0]?.currency || 'USD'} />
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>No self-reimbursement charges for this vendor.</div>
            )}
          </div>
        )}

        {/* Third-Party Tab */}
        {activeTab === 'third-party' && (
          <div>
            {data.thirdPartyCharges.length > 0 ? (
              <ThirdPartyChargeTable rows={data.thirdPartyCharges} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>No third-party reimbursement charges for this vendor.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export type { ConfirmationChargeRow, TPChargeRow };
export default ChargeConfirmationView;
