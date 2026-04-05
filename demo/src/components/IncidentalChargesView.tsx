import React, { useState, useMemo } from 'react';
import type { ChargeType, BLRow, ContainerRow } from '../data/incidentalCharges';
import {
  CHARGE_LIST, CHARGE_TYPE_MAP, createDemoBLRows, createDemoContainerRows,
  INCIDENTAL_RATES, TP_VENDOR_OPTIONS, autoFillGST,
} from '../data/incidentalCharges';

// ════════════════════════════════════════════════════
// State types
// ════════════════════════════════════════════════════

interface ChargeData {
  chargeName: string;
  chargeType: ChargeType;
  blRows: BLRow[];
  containerRows: ContainerRow[];
}

export interface IncidentalDraft {
  selectedCharges: Array<{ name: string; type: ChargeType }>;
  chargeData: ChargeData[];
  phase: 'selection' | 'detail';
  sentForApproval?: boolean; // true after Send for Approval is clicked
}

interface Props {
  taskName: string;
  onClose: () => void;
  onSendForApproval: () => void;
  savedDraft?: IncidentalDraft | null;
  onSaveDraft: (draft: IncidentalDraft) => void;
}

// ════════════════════════════════════════════════════
// Charge Selection Screen
// ════════════════════════════════════════════════════

const ChargeSelectionScreen: React.FC<{
  charges: Array<{ name: string; type: ChargeType }>;
  onChange: (charges: Array<{ name: string; type: ChargeType }>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ charges, onChange, onSubmit, onCancel }) => {
  const selectedNames = charges.map(c => c.name);

  const getAvailableCharges = (currentIdx: number) => {
    const othersSelected = charges.filter((_, i) => i !== currentIdx).map(c => c.name);
    return CHARGE_LIST.filter(c => !othersSelected.includes(c.name));
  };

  const handleChange = (idx: number, name: string) => {
    const updated = [...charges];
    updated[idx] = { name, type: CHARGE_TYPE_MAP[name] };
    onChange(updated);
  };

  const handleRemove = (idx: number) => {
    onChange(charges.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    onChange([...charges, { name: '', type: 'Incidental' as ChargeType }]);
  };

  return (
    <div style={{ padding: '24px 20px' }}>
      {charges.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Incidental Charge {charges.length > 1 ? `#${i + 1}` : ''}</div>
            <select
              className="field-select"
              value={c.name}
              onChange={e => handleChange(i, e.target.value)}
            >
              <option value="">Select charge...</option>
              {getAvailableCharges(i).map(ch => (
                <option key={ch.name} value={ch.name}>{ch.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Type of Charge</div>
            <input
              className="field-input"
              value={c.name ? CHARGE_TYPE_MAP[c.name] || '' : ''}
              readOnly
              style={{ background: '#f5f5f5', color: '#666' }}
            />
          </div>
          {charges.length > 1 && (
            <button onClick={() => handleRemove(i)} style={{
              background: 'none', border: 'none', color: '#ff4d4f', fontSize: 18,
              cursor: 'pointer', marginTop: 18, padding: 4,
            }}>&#10005;</button>
          )}
        </div>
      ))}

      {selectedNames.filter(Boolean).length < CHARGE_LIST.length && (
        <button onClick={handleAdd} style={{
          color: '#006EC3', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: 'none', border: 'none', padding: '8px 0', display: 'flex',
          alignItems: 'center', gap: 4, fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 16 }}>+</span> Add More
        </button>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
        <button className="btn-reject" onClick={onCancel} style={{ border: '1px solid #999', color: '#333' }}>Cancel</button>
        <button
          className="btn-submit"
          onClick={onSubmit}
          style={{ opacity: selectedNames.filter(Boolean).length > 0 ? 1 : 0.5 }}
          disabled={selectedNames.filter(Boolean).length === 0}
        >Submit</button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// Table renderers per charge type
// ════════════════════════════════════════════════════

const thStyle: React.CSSProperties = {
  padding: '6px 8px', fontSize: 10, fontWeight: 600, color: '#333',
  background: '#E3F2FD', borderBottom: '1px solid #BBDEFB', textAlign: 'left',
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '6px 8px', fontSize: 11, borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'middle',
};
const inputSmall: React.CSSProperties = {
  width: '100%', height: 26, border: '1px solid #d9d9d9', borderRadius: 3,
  padding: '0 6px', fontSize: 11, fontFamily: 'inherit', outline: 'none',
};

// Incidental Type Table
const IncidentalTable: React.FC<{
  charge: ChargeData;
  onUpdate: (c: ChargeData) => void;
  statusText: string;
}> = ({ charge, onUpdate, statusText }) => {
  const rates = INCIDENTAL_RATES[charge.chargeName] || { blRate: 600, containerRate: 300 };

  const toggleBL = (idx: number) => {
    const updated = { ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) };
    onUpdate(updated);
  };
  const toggleCN = (idx: number) => {
    const updated = { ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) };
    onUpdate(updated);
  };

  const blTotal = charge.blRows.filter(r => r.selected).length * rates.blRate;
  const cnTotal = charge.containerRows.filter(r => r.selected).length * rates.containerRate;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>{charge.chargeName}</div>

      {/* BL-wise */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>BL-wise</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead><tr>
          <th style={{ ...thStyle, width: 30 }}>☐</th>
          <th style={thStyle}>BL No.</th><th style={thStyle}>BL Date</th>
          <th style={thStyle}>Rate based on PCD</th><th style={thStyle}>Currency</th>
          <th style={thStyle}>Attachment</th><th style={thStyle}>Status</th>
        </tr></thead>
        <tbody>
          {charge.blRows.map((r, i) => (
            <tr key={r.id}>
              <td style={tdStyle}><input type="checkbox" checked={r.selected} onChange={() => toggleBL(i)} /></td>
              <td style={tdStyle}>{r.blNo}</td><td style={tdStyle}>{r.blDate}</td>
              <td style={tdStyle}>{rates.blRate}</td><td style={tdStyle}>INR</td>
              <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
              <td style={{ ...tdStyle, color: r.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{r.selected ? statusText : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right', marginBottom: 12 }}>BL Total: INR {blTotal.toLocaleString()}</div>

      {/* Container-wise */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Container-wise — Rate/Container = {rates.containerRate}, Currency = INR</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead><tr>
          <th style={{ ...thStyle, width: 30 }}>☐</th>
          <th style={thStyle}>Container No</th><th style={thStyle}>PCD</th>
          <th style={thStyle}>Rate based on PCD</th><th style={thStyle}>Currency</th>
          <th style={thStyle}>Attachment</th><th style={thStyle}>Status</th>
        </tr></thead>
        <tbody>
          {charge.containerRows.map((r, i) => (
            <tr key={r.id}>
              <td style={tdStyle}><input type="checkbox" checked={r.selected} onChange={() => toggleCN(i)} /></td>
              <td style={tdStyle}>{r.containerNo}</td><td style={tdStyle}>{r.date}</td>
              <td style={tdStyle}>{rates.containerRate}</td><td style={tdStyle}>INR</td>
              <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
              <td style={{ ...tdStyle, color: r.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{r.selected ? statusText : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>Container Total: INR {cnTotal.toLocaleString()}</div>
    </div>
  );
};

// Self-Reimbursement Type Table
const SelfReimbTable: React.FC<{
  charge: ChargeData;
  onUpdate: (c: ChargeData) => void;
  statusText: string;
}> = ({ charge, onUpdate, statusText }) => {
  const updateBL = (idx: number, field: keyof BLRow, value: string) => {
    const updated = { ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, [field]: value } : r) };
    onUpdate(updated);
  };
  const updateCN = (idx: number, field: keyof ContainerRow, value: string) => {
    const updated = { ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, [field]: value } : r) };
    onUpdate(updated);
  };
  const toggleBL = (idx: number) => {
    const updated = { ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) };
    onUpdate(updated);
  };
  const toggleCN = (idx: number) => {
    const updated = { ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) };
    onUpdate(updated);
  };

  const blTotal = charge.blRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.rate) || 0), 0);
  const cnTotal = charge.containerRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.rate) || 0), 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>{charge.chargeName}</div>

      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>BL-wise</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead><tr>
          <th style={{ ...thStyle, width: 30 }}>☐</th>
          <th style={thStyle}>BL No.</th><th style={thStyle}>BL Date</th>
          <th style={thStyle}>Rate</th><th style={thStyle}>Currency</th>
          <th style={thStyle}>Attachment</th><th style={thStyle}>Status</th>
        </tr></thead>
        <tbody>
          {charge.blRows.map((r, i) => (
            <tr key={r.id}>
              <td style={tdStyle}><input type="checkbox" checked={r.selected} onChange={() => toggleBL(i)} /></td>
              <td style={tdStyle}>{r.blNo}</td><td style={tdStyle}>{r.blDate}</td>
              <td style={tdStyle}><input style={inputSmall} type="number" placeholder="Enter rate" value={r.rate} onChange={e => updateBL(i, 'rate', e.target.value)} /></td>
              <td style={tdStyle}><select style={{ ...inputSmall, width: 70 }} value={r.currency} onChange={e => updateBL(i, 'currency', e.target.value)}><option>INR</option><option>USD</option></select></td>
              <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
              <td style={{ ...tdStyle, color: r.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{r.selected ? statusText : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right', marginBottom: 12 }}>BL Total: INR {blTotal.toLocaleString()}</div>

      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Container-wise</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead><tr>
          <th style={{ ...thStyle, width: 30 }}>☐</th>
          <th style={thStyle}>Container No</th><th style={thStyle}>Date</th>
          <th style={thStyle}>Rate</th><th style={thStyle}>Currency</th>
          <th style={thStyle}>Attachment</th><th style={thStyle}>Status</th>
        </tr></thead>
        <tbody>
          {charge.containerRows.map((r, i) => (
            <tr key={r.id}>
              <td style={tdStyle}><input type="checkbox" checked={r.selected} onChange={() => toggleCN(i)} /></td>
              <td style={tdStyle}>{r.containerNo}</td><td style={tdStyle}>{r.date}</td>
              <td style={tdStyle}><input style={inputSmall} type="number" placeholder="Enter rate" value={r.rate} onChange={e => updateCN(i, 'rate', e.target.value)} /></td>
              <td style={tdStyle}><select style={{ ...inputSmall, width: 70 }} value={r.currency} onChange={e => updateCN(i, 'currency', e.target.value)}><option>INR</option><option>USD</option></select></td>
              <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
              <td style={{ ...tdStyle, color: r.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{r.selected ? statusText : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>Container Total: INR {cnTotal.toLocaleString()}</div>
    </div>
  );
};

// Third-Party Reimbursement Type Table
const ThirdPartyTable: React.FC<{
  charge: ChargeData;
  onUpdate: (c: ChargeData) => void;
  statusText: string;
}> = ({ charge, onUpdate, statusText }) => {
  const updateBL = (idx: number, field: keyof BLRow, value: string) => {
    const row = charge.blRows[idx];
    const updated = { ...row, [field]: value };
    // Auto-fill GST when basicValue changes
    if (field === 'basicValue') {
      const gst = autoFillGST(value);
      updated.cgst = gst.cgst;
      updated.sgst = gst.sgst;
      updated.igst = gst.igst;
      updated.tpInvoiceValue = (parseFloat(value || '0') + parseFloat(gst.cgst) + parseFloat(gst.sgst) + parseFloat(gst.igst)).toFixed(2);
    }
    if (field === 'tpVendorCode') {
      const vendor = TP_VENDOR_OPTIONS.find(v => v.code === value);
      updated.tpVendorName = vendor?.name || '';
    }
    const newCharge = { ...charge, blRows: charge.blRows.map((r, i) => i === idx ? updated : r) };
    onUpdate(newCharge);
  };
  const updateCN = (idx: number, field: keyof ContainerRow, value: string) => {
    const row = charge.containerRows[idx];
    const updated = { ...row, [field]: value };
    if (field === 'basicValue') {
      const gst = autoFillGST(value);
      updated.cgst = gst.cgst;
      updated.sgst = gst.sgst;
      updated.igst = gst.igst;
      updated.tpInvoiceValue = (parseFloat(value || '0') + parseFloat(gst.cgst) + parseFloat(gst.sgst) + parseFloat(gst.igst)).toFixed(2);
    }
    if (field === 'tpVendorCode') {
      const vendor = TP_VENDOR_OPTIONS.find(v => v.code === value);
      updated.tpVendorName = vendor?.name || '';
    }
    const newCharge = { ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? updated : r) };
    onUpdate(newCharge);
  };
  const toggleBL = (idx: number) => {
    onUpdate({ ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };
  const toggleCN = (idx: number) => {
    onUpdate({ ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };

  const blTotal = charge.blRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.tpInvoiceValue) || 0), 0);
  const cnTotal = charge.containerRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.tpInvoiceValue) || 0), 0);

  const renderTable = (
    rows: Array<BLRow | ContainerRow>,
    isBL: boolean,
    toggle: (i: number) => void,
    update: (i: number, field: string, value: string) => void,
  ) => (
    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
        <thead><tr>
          <th style={{ ...thStyle, width: 30 }}>☐</th>
          <th style={thStyle}>{isBL ? 'BL No.' : 'Container No'}</th>
          <th style={thStyle}>{isBL ? 'BL Date' : 'Date'}</th>
          <th style={thStyle}>3rd Party Invoice No.</th>
          <th style={thStyle}>3rd Party Invoice Date</th>
          <th style={thStyle}>3rd Party Invoice Value</th>
          <th style={thStyle}>Basic Value</th>
          <th style={thStyle}>CGST</th><th style={thStyle}>SGST</th><th style={thStyle}>IGST</th>
          <th style={thStyle}>3rd Party Vendor Code</th>
          <th style={thStyle}>3rd Party Vendor Name</th>
          <th style={thStyle}>Attachment</th>
          <th style={thStyle}>Status</th>
        </tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const row = r as BLRow & ContainerRow;
            return (
              <tr key={row.id}>
                <td style={tdStyle}><input type="checkbox" checked={row.selected} onChange={() => toggle(i)} /></td>
                <td style={tdStyle}>{isBL ? row.blNo : row.containerNo}</td>
                <td style={tdStyle}>{isBL ? row.blDate : row.date}</td>
                <td style={tdStyle}><input style={inputSmall} placeholder="Invoice No" value={row.tpInvoiceNo} onChange={e => update(i, 'tpInvoiceNo', e.target.value)} /></td>
                <td style={tdStyle}><input style={inputSmall} type="date" value={row.tpInvoiceDate} onChange={e => update(i, 'tpInvoiceDate', e.target.value)} /></td>
                <td style={{ ...tdStyle, background: '#f9f9f9', fontWeight: 600, fontSize: 11 }}>{row.tpInvoiceValue || '—'}</td>
                <td style={tdStyle}><input style={inputSmall} type="number" placeholder="Basic value" value={row.basicValue} onChange={e => update(i, 'basicValue', e.target.value)} /></td>
                <td style={{ ...tdStyle, fontSize: 10, color: '#666' }}>{row.cgst || '—'}</td>
                <td style={{ ...tdStyle, fontSize: 10, color: '#666' }}>{row.sgst || '—'}</td>
                <td style={{ ...tdStyle, fontSize: 10, color: '#666' }}>{row.igst || '—'}</td>
                <td style={tdStyle}>
                  <select style={{ ...inputSmall, width: 80 }} value={row.tpVendorCode} onChange={e => update(i, 'tpVendorCode', e.target.value)}>
                    <option value="">Select...</option>
                    {TP_VENDOR_OPTIONS.map(v => <option key={v.code} value={v.code}>{v.code}</option>)}
                  </select>
                </td>
                <td style={{ ...tdStyle, fontSize: 10, color: '#666' }}>{row.tpVendorName || '—'}</td>
                <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
                <td style={{ ...tdStyle, color: row.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{row.selected ? statusText : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>{charge.chargeName}</div>

      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>BL-wise</div>
      {renderTable(charge.blRows, true, toggleBL, (i, f, v) => updateBL(i, f as keyof BLRow, v))}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right', marginBottom: 12 }}>BL Total: INR {blTotal.toFixed(2)}</div>

      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Container-wise</div>
      {renderTable(charge.containerRows, false, toggleCN, (i, f, v) => updateCN(i, f as keyof ContainerRow, v))}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>Container Total: INR {cnTotal.toFixed(2)}</div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════

const IncidentalChargesView: React.FC<Props> = ({ taskName, onClose, onSendForApproval, savedDraft, onSaveDraft }) => {
  const [selectedCharges, setSelectedCharges] = useState<Array<{ name: string; type: ChargeType }>>(
    savedDraft?.selectedCharges || [{ name: '', type: 'Incidental' }]
  );
  const [phase, setPhase] = useState<'selection' | 'detail'>(savedDraft?.phase || 'selection');
  const [chargeData, setChargeData] = useState<ChargeData[]>(savedDraft?.chargeData || []);
  const [wasSentForApproval, setWasSentForApproval] = useState(savedDraft?.sentForApproval || false);
  const [activeChargeTab, setActiveChargeTab] = useState<ChargeType>('Incidental');

  // Build charge data from selections
  const buildChargeData = () => {
    const data: ChargeData[] = selectedCharges
      .filter(c => c.name)
      .map(c => {
        // Check if existing data for this charge
        const existing = chargeData.find(d => d.chargeName === c.name);
        if (existing) return existing;
        return {
          chargeName: c.name,
          chargeType: c.type,
          blRows: createDemoBLRows(),
          containerRows: createDemoContainerRows(),
        };
      });
    setChargeData(data);
    setPhase('detail');
  };

  const updateChargeData = (idx: number, updated: ChargeData) => {
    setChargeData(prev => prev.map((c, i) => i === idx ? updated : c));
  };

  // Group by type
  const grouped = useMemo(() => {
    const g: Record<ChargeType, ChargeData[]> = {
      'Incidental': [], 'Self-Reimbursement': [], 'Third-Party Reimbursement': [],
    };
    chargeData.forEach(c => { if (g[c.chargeType]) g[c.chargeType].push(c); });
    return g;
  }, [chargeData]);

  // Grand total
  const grandTotal = useMemo(() => {
    let total = 0;
    chargeData.forEach(c => {
      const rates = INCIDENTAL_RATES[c.chargeName];
      if (c.chargeType === 'Incidental' && rates) {
        total += c.blRows.filter(r => r.selected).length * rates.blRate;
        total += c.containerRows.filter(r => r.selected).length * rates.containerRate;
      } else if (c.chargeType === 'Self-Reimbursement') {
        total += c.blRows.filter(r => r.selected).reduce((s, r) => s + (parseFloat(r.rate) || 0), 0);
        total += c.containerRows.filter(r => r.selected).reduce((s, r) => s + (parseFloat(r.rate) || 0), 0);
      } else if (c.chargeType === 'Third-Party Reimbursement') {
        total += c.blRows.filter(r => r.selected).reduce((s, r) => s + (parseFloat(r.tpInvoiceValue) || 0), 0);
        total += c.containerRows.filter(r => r.selected).reduce((s, r) => s + (parseFloat(r.tpInvoiceValue) || 0), 0);
      }
    });
    return total;
  }, [chargeData]);

  const handleSaveDraft = () => {
    onSaveDraft({ selectedCharges, chargeData, phase, sentForApproval: wasSentForApproval });
  };

  const handleCancel = () => {
    if (savedDraft) {
      // Revert to saved draft
      setSelectedCharges(savedDraft.selectedCharges);
      setChargeData(savedDraft.chargeData);
      setPhase(savedDraft.phase);
    } else {
      setPhase('selection');
      setChargeData([]);
    }
  };

  // Selection phase
  if (phase === 'selection') {
    return (
      <div className="task-detail">
        <div className="task-detail-header">
          <div className="task-detail-header-left">
            <button className="task-detail-close" onClick={onClose}>&#10005;</button>
            <span className="task-detail-title">{taskName}</span>
          </div>
        </div>
        <ChargeSelectionScreen
          charges={selectedCharges}
          onChange={setSelectedCharges}
          onSubmit={buildChargeData}
          onCancel={onClose}
        />
        {savedDraft && savedDraft.phase === 'detail' && (
          <div style={{ padding: '0 20px 20px' }}>
            <button
              onClick={() => { setChargeData(savedDraft.chargeData); setPhase('detail'); }}
              style={{
                background: '#E3F2FD', color: '#006EC3', border: '1px solid #BBDEFB',
                borderRadius: 4, padding: '8px 16px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Show Draft
            </button>
          </div>
        )}
      </div>
    );
  }

  // Detail phase
  const typeLabels: Record<ChargeType, { label: string; color: string; bg: string }> = {
    'Incidental': { label: 'Incidental Charges', color: '#E65100', bg: '#FFF3E0' },
    'Self-Reimbursement': { label: 'Self-Reimbursement Charges', color: '#1565C0', bg: '#E3F2FD' },
    'Third-Party Reimbursement': { label: 'Third-Party Reimbursement', color: '#2E7D32', bg: '#E8F5E9' },
  };

  // Available tabs — only types that have charges
  const availableTabs = (['Incidental', 'Self-Reimbursement', 'Third-Party Reimbursement'] as ChargeType[])
    .filter(type => grouped[type].length > 0);

  // Ensure active tab is valid
  const currentTab = availableTabs.includes(activeChargeTab) ? activeChargeTab : availableTabs[0];

  // Status text logic
  const statusText = wasSentForApproval ? 'Sent for Approval' : 'Selected for Approval';

  const activeCharges = grouped[currentTab] || [];

  const handleSendForApproval = () => {
    setWasSentForApproval(true);
    // Save draft with sentForApproval flag before sending
    onSaveDraft({ selectedCharges, chargeData, phase, sentForApproval: true });
    onSendForApproval();
  };

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <div className="task-detail-header-left">
          <button className="task-detail-close" onClick={() => setPhase('selection')}>&#10005;</button>
          <span className="task-detail-title">{taskName}</span>
        </div>
        <div className="task-detail-actions">
          <button className="btn-reject" onClick={handleCancel} style={{ border: '1px solid #999', color: '#333' }}>Cancel</button>
          <button onClick={handleSaveDraft} style={{
            height: 32, padding: '0 16px', border: '1px solid #006EC3', borderRadius: 4,
            background: '#fff', color: '#006EC3', fontSize: 13, cursor: 'pointer',
            fontWeight: 600, fontFamily: 'inherit',
          }}>Save as Draft</button>
          <button className="btn-approve" onClick={handleSendForApproval}>Send for Approval</button>
        </div>
      </div>

      {/* Charge type tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid #e8e8e8', background: '#FAFAFA',
      }}>
        {availableTabs.map(type => {
          const style = typeLabels[type];
          return (
            <button
              key={type}
              onClick={() => setActiveChargeTab(type)}
              style={{
                padding: '10px 16px', fontSize: 12, fontFamily: 'inherit',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: currentTab === type ? `3px solid ${style.color}` : '3px solid transparent',
                color: currentTab === type ? style.color : '#666',
                fontWeight: currentTab === type ? 700 : 400,
              }}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      <div className="task-detail-body" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
        {/* Active tab content */}
        <div style={{ padding: '12px 0' }}>
          {activeCharges.map((c, idx) => {
            const globalIdx = chargeData.indexOf(c);
            if (currentTab === 'Incidental') return <IncidentalTable key={idx} charge={c} onUpdate={u => updateChargeData(globalIdx, u)} statusText={statusText} />;
            if (currentTab === 'Self-Reimbursement') return <SelfReimbTable key={idx} charge={c} onUpdate={u => updateChargeData(globalIdx, u)} statusText={statusText} />;
            return <ThirdPartyTable key={idx} charge={c} onUpdate={u => updateChargeData(globalIdx, u)} statusText={statusText} />;
          })}
        </div>

        {/* Grand Total */}
        <div style={{
          borderTop: '2px solid #e0e0e0', paddingTop: 16, marginTop: 8,
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Grand Total (All Charges)</div>
          <div style={{
            background: '#F5F5F5', borderRadius: 4, padding: '10px 16px',
            fontSize: 18, fontWeight: 700, color: '#333',
          }}>
            INR {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentalChargesView;
