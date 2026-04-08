import React, { useState, useMemo, useRef } from 'react';
import type { ChargeType, ChargeLevel, BLRow, ContainerRow } from '../data/incidentalCharges';
import {
  CHARGE_LIST, CHARGE_TYPE_MAP, CHARGE_LEVEL_MAP, createSingleBLRow, createDemoContainerRows,
  INCIDENTAL_RATES, TP_VENDOR_OPTIONS, CHA_SELF_REIMB_RATES, CHA_THIRD_PARTY_PREFILL, SAC_CODES,
} from '../data/incidentalCharges';

// ════════════════════════════════════════════════════
// State types
// ════════════════════════════════════════════════════

interface ChargeData {
  chargeName: string;
  chargeType: ChargeType;
  chargeLevel: ChargeLevel;
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
  submitted?: boolean;
}

// ════════════════════════════════════════════════════
// Charge Selection Screen
// ════════════════════════════════════════════════════

const ChargeSelectionScreen: React.FC<{
  charges: Array<{ name: string; type: ChargeType }>;
  onChange: (charges: Array<{ name: string; type: ChargeType }>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  locked?: boolean;
}> = ({ charges, onChange, onSubmit, onCancel, locked }) => {
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
              disabled={locked}
              style={locked ? { background: '#f5f5f5', color: '#666' } : undefined}
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
          {charges.length > 1 && !locked && (
            <button onClick={() => handleRemove(i)} style={{
              background: 'none', border: 'none', color: '#ff4d4f', fontSize: 18,
              cursor: 'pointer', marginTop: 18, padding: 4,
            }}>&#10005;</button>
          )}
        </div>
      ))}

      {!locked && selectedNames.filter(Boolean).length < CHARGE_LIST.length && (
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

// Approver response badge + remark
const ApproverCell: React.FC<{ action?: string; remark?: string }> = ({ action, remark }) => {
  if (!action) return <span style={{ color: '#bbb', fontSize: 10 }}>—</span>;
  const colors: Record<string, { bg: string; c: string }> = {
    Approved: { bg: '#D3FFEA', c: '#0F6E3C' },
    Rejected: { bg: '#FFD3D3', c: '#A00' },
  };
  const s = colors[action] || { bg: '#E0E0E0', c: '#666' };
  return (
    <div>
      <span style={{ padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 600, background: s.bg, color: s.c, display: 'inline-block', marginBottom: remark ? 3 : 0 }}>
        {action}
      </span>
      {remark && <div style={{ fontSize: 9, color: '#666', lineHeight: '1.3', maxWidth: 160 }}>{remark}</div>}
    </div>
  );
};

// Incidental Type Table — shows only BL or Container based on charge level
const IncidentalTable: React.FC<{
  charge: ChargeData;
  onUpdate: (c: ChargeData) => void;
  statusText: string;
}> = ({ charge, onUpdate, statusText }) => {
  const rates = INCIDENTAL_RATES[charge.chargeName] || { blRate: 600, containerRate: 300 };
  const isBL = charge.chargeLevel === 'BL';
  const rows = isBL ? charge.blRows : charge.containerRows;
  const hasApproverData = rows.some(r => r.approverAction);

  const toggleBL = (idx: number) => {
    if (charge.blRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };
  const toggleCN = (idx: number) => {
    if (charge.containerRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };

  const blTotal = charge.blRows.filter(r => r.selected).length * rates.blRate;
  const cnTotal = charge.containerRows.filter(r => r.selected).length * rates.containerRate;

  const renderRows = (rowList: typeof rows, isBLTable: boolean, toggle: (i: number) => void, rate: number) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
      <thead><tr>
        <th style={{ ...thStyle, width: 30 }}>☐</th>
        <th style={thStyle}>{isBLTable ? 'BL No.' : 'Container No'}</th>
        <th style={thStyle}>{isBLTable ? 'BL Date' : 'PCD'}</th>
        <th style={thStyle}>SAC Code</th>
        <th style={thStyle}>Rate based on PCD</th><th style={thStyle}>Currency</th>
        <th style={thStyle}>Attachment</th><th style={thStyle}>Status</th>
        {hasApproverData && <th style={{ ...thStyle, minWidth: 140 }}>Approver Response</th>}
      </tr></thead>
      <tbody>
        {rowList.map((r, i) => {
          const locked = r.approverAction === 'Approved';
          return (
            <tr key={r.id} style={{ background: locked ? '#F8FFF8' : undefined, opacity: locked ? 0.75 : 1 }}>
              <td style={tdStyle}><input type="checkbox" checked={r.selected} onChange={() => toggle(i)} disabled={locked} /></td>
              <td style={tdStyle}>{isBLTable ? (r as BLRow).blNo : (r as ContainerRow).containerNo}</td>
              <td style={tdStyle}>{isBLTable ? (r as BLRow).blDate : (r as ContainerRow).date}</td>
              <td style={tdStyle}>{SAC_CODES[charge.chargeName] || '-'}</td>
              <td style={tdStyle}>{rate}</td><td style={tdStyle}>USD</td>
              <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
              <td style={{ ...tdStyle, color: r.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{r.selected ? statusText : '—'}</td>
              {hasApproverData && <td style={tdStyle}><ApproverCell action={r.approverAction} remark={r.approverRemark} /></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>
        {charge.chargeName}
        <span style={{ fontSize: 10, fontWeight: 400, color: '#999', marginLeft: 8 }}>({isBL ? 'BL Level' : 'Container Level'})</span>
      </div>
      {isBL ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>BL-wise</div>
          {renderRows(charge.blRows, true, toggleBL, rates.blRate)}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>BL Total: USD {blTotal.toLocaleString()}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Container-wise — Rate/Container = {rates.containerRate}, Currency = USD</div>
          {renderRows(charge.containerRows, false, toggleCN, rates.containerRate)}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>Container Total: USD {cnTotal.toLocaleString()}</div>
        </>
      )}
    </div>
  );
};

// Self-Reimbursement Type Table — shows only BL or Container based on charge level
const SelfReimbTable: React.FC<{
  charge: ChargeData;
  onUpdate: (c: ChargeData) => void;
  statusText: string;
}> = ({ charge, onUpdate, statusText }) => {
  const isBL = charge.chargeLevel === 'BL';
  const allRows = isBL ? charge.blRows : charge.containerRows;
  const hasApproverData = allRows.some(r => r.approverAction);

  const updateBL = (idx: number, field: keyof BLRow, value: string) => {
    if (charge.blRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, [field]: value } : r) });
  };
  const updateCN = (idx: number, field: keyof ContainerRow, value: string) => {
    if (charge.containerRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, [field]: value } : r) });
  };
  const toggleBL = (idx: number) => {
    if (charge.blRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };
  const toggleCN = (idx: number) => {
    if (charge.containerRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };

  const blTotal = charge.blRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.rate) || 0), 0);
  const cnTotal = charge.containerRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.rate) || 0), 0);

  const renderSelfRows = (rowList: (BLRow | ContainerRow)[], isBLTable: boolean, toggle: (i: number) => void, update: (i: number, field: string, value: string) => void) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
      <thead><tr>
        <th style={{ ...thStyle, width: 30 }}>☐</th>
        <th style={thStyle}>{isBLTable ? 'BL No.' : 'Container No'}</th>
        <th style={thStyle}>{isBLTable ? 'BL Date' : 'Date'}</th>
        <th style={thStyle}>SAC Code</th>
        <th style={thStyle}>Rate</th><th style={thStyle}>Currency</th>
        <th style={thStyle}>Attachment</th><th style={thStyle}>Status</th>
        {hasApproverData && <th style={{ ...thStyle, minWidth: 140 }}>Approver Response</th>}
      </tr></thead>
      <tbody>
        {rowList.map((r, i) => {
          const locked = r.approverAction === 'Approved';
          return (
            <tr key={r.id} style={{ background: locked ? '#F8FFF8' : undefined, opacity: locked ? 0.75 : 1 }}>
              <td style={tdStyle}><input type="checkbox" checked={r.selected} onChange={() => toggle(i)} disabled={locked} /></td>
              <td style={tdStyle}>{isBLTable ? (r as BLRow).blNo : (r as ContainerRow).containerNo}</td>
              <td style={tdStyle}>{isBLTable ? (r as BLRow).blDate : (r as ContainerRow).date}</td>
              <td style={tdStyle}>{SAC_CODES[charge.chargeName] || '-'}</td>
              <td style={tdStyle}><input style={{ ...inputSmall, background: locked ? '#f0f0f0' : '#fff' }} type="number" placeholder="Enter rate" value={r.rate} disabled={locked} onChange={e => update(i, 'rate', e.target.value)} /></td>
              <td style={tdStyle}><select style={{ ...inputSmall, width: 70, background: locked ? '#f0f0f0' : '#fff' }} value={r.currency} disabled={locked} onChange={e => update(i, 'currency', e.target.value)}><option>USD</option><option>USD</option></select></td>
              <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
              <td style={{ ...tdStyle, color: r.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{r.selected ? statusText : '—'}</td>
              {hasApproverData && <td style={tdStyle}><ApproverCell action={r.approverAction} remark={r.approverRemark} /></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>
        {charge.chargeName}
        <span style={{ fontSize: 10, fontWeight: 400, color: '#999', marginLeft: 8 }}>({isBL ? 'BL Level' : 'Container Level'})</span>
      </div>
      {isBL ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>BL-wise</div>
          {renderSelfRows(charge.blRows, true, toggleBL, (i, f, v) => updateBL(i, f as keyof BLRow, v))}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>BL Total: USD {blTotal.toLocaleString()}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Container-wise</div>
          {renderSelfRows(charge.containerRows, false, toggleCN, (i, f, v) => updateCN(i, f as keyof ContainerRow, v))}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>Container Total: USD {cnTotal.toLocaleString()}</div>
        </>
      )}
    </div>
  );
};

// Helper: recalculate invoice value from basic + GST
const calcInvoiceValue = (row: { basicValue: string; cgst: string; sgst: string; igst: string }) => {
  const bv = parseFloat(row.basicValue) || 0;
  const c = parseFloat(row.cgst) || 0;
  const s = parseFloat(row.sgst) || 0;
  const ig = parseFloat(row.igst) || 0;
  return (bv + c + s + ig).toFixed(2);
};

// Third-Party Reimbursement Type Table — level-based, manual GST
const ThirdPartyTable: React.FC<{
  charge: ChargeData;
  onUpdate: (c: ChargeData) => void;
  statusText: string;
}> = ({ charge, onUpdate, statusText }) => {
  const isBL = charge.chargeLevel === 'BL';
  const allRows = isBL ? charge.blRows : charge.containerRows;
  const hasApproverData = allRows.some(r => r.approverAction);

  const updateRow = (rows: (BLRow | ContainerRow)[], idx: number, field: string, value: string, isBLRows: boolean) => {
    if (rows[idx].approverAction === 'Approved') return;
    const row = { ...rows[idx], [field]: value } as BLRow & ContainerRow;

    // GST logic: CGST auto-fills SGST with same value
    if (field === 'cgst') {
      row.sgst = value;
      row.igst = '';
      row.tpInvoiceValue = calcInvoiceValue(row);
    } else if (field === 'sgst') {
      row.igst = '';
      row.tpInvoiceValue = calcInvoiceValue(row);
    } else if (field === 'igst') {
      row.cgst = '';
      row.sgst = '';
      row.tpInvoiceValue = calcInvoiceValue(row);
    } else if (field === 'basicValue') {
      row.tpInvoiceValue = calcInvoiceValue(row);
    }

    if (field === 'tpVendorCode') {
      const vendor = TP_VENDOR_OPTIONS.find(v => v.code === value);
      row.tpVendorName = vendor?.name || '';
    }

    const updatedRows = rows.map((r, i) => i === idx ? row : r);
    if (isBLRows) {
      onUpdate({ ...charge, blRows: updatedRows as BLRow[] });
    } else {
      onUpdate({ ...charge, containerRows: updatedRows as ContainerRow[] });
    }
  };

  const toggleBL = (idx: number) => {
    if (charge.blRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, blRows: charge.blRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };
  const toggleCN = (idx: number) => {
    if (charge.containerRows[idx].approverAction === 'Approved') return;
    onUpdate({ ...charge, containerRows: charge.containerRows.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) });
  };

  const activeRows = isBL ? charge.blRows : charge.containerRows;
  const total = activeRows.filter(r => r.selected).reduce((sum, r) => sum + (parseFloat(r.tpInvoiceValue) || 0), 0);

  const renderTable = (
    rows: Array<BLRow | ContainerRow>,
    isBLTable: boolean,
    toggle: (i: number) => void,
  ) => (
    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
        <thead><tr>
          <th style={{ ...thStyle, width: 30 }}>☐</th>
          <th style={thStyle}>{isBLTable ? 'BL No.' : 'Container No'}</th>
          <th style={thStyle}>{isBLTable ? 'BL Date' : 'Date'}</th>
          <th style={thStyle}>SAC Code</th>
          <th style={thStyle}>3rd Party Invoice No.</th>
          <th style={thStyle}>3rd Party Invoice Date</th>
          <th style={thStyle}>3rd Party Invoice Value</th>
          <th style={thStyle}>Basic Value</th>
          <th style={thStyle}>CGST</th><th style={thStyle}>SGST</th><th style={thStyle}>IGST</th>
          <th style={thStyle}>3rd Party Vendor Code</th>
          <th style={thStyle}>3rd Party Vendor Name</th>
          <th style={thStyle}>Attachment</th>
          <th style={thStyle}>Status</th>
          {hasApproverData && <th style={{ ...thStyle, minWidth: 140 }}>Approver Response</th>}
        </tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const row = r as BLRow & ContainerRow;
            const locked = row.approverAction === 'Approved';
            const hasCgstSgst = !!(row.cgst || row.sgst);
            const hasIgst = !!row.igst;
            const disabledBg = '#f0f0f0';
            return (
              <tr key={row.id} style={{ background: locked ? '#F8FFF8' : undefined, opacity: locked ? 0.75 : 1 }}>
                <td style={tdStyle}><input type="checkbox" checked={row.selected} onChange={() => toggle(i)} disabled={locked} /></td>
                <td style={tdStyle}>{isBLTable ? row.blNo : row.containerNo}</td>
                <td style={tdStyle}>{isBLTable ? row.blDate : row.date}</td>
                <td style={tdStyle}>{SAC_CODES[charge.chargeName] || '-'}</td>
                <td style={tdStyle}><input style={{ ...inputSmall, background: locked ? disabledBg : '#fff' }} placeholder="Invoice No" value={row.tpInvoiceNo} disabled={locked} onChange={e => updateRow(rows, i, 'tpInvoiceNo', e.target.value, isBLTable)} /></td>
                <td style={tdStyle}><input style={{ ...inputSmall, background: locked ? disabledBg : '#fff' }} type="date" value={row.tpInvoiceDate} disabled={locked} onChange={e => updateRow(rows, i, 'tpInvoiceDate', e.target.value, isBLTable)} /></td>
                <td style={{ ...tdStyle, background: '#f9f9f9', fontWeight: 600, fontSize: 11 }}>{row.tpInvoiceValue || '—'}</td>
                <td style={tdStyle}><input style={{ ...inputSmall, background: locked ? disabledBg : '#fff' }} type="number" placeholder="Basic value" value={row.basicValue} disabled={locked} onChange={e => updateRow(rows, i, 'basicValue', e.target.value, isBLTable)} /></td>
                <td style={tdStyle}>
                  <input style={{ ...inputSmall, width: 65, background: (hasIgst || locked) ? disabledBg : '#fff' }} type="number" placeholder="CGST" value={row.cgst} disabled={hasIgst || locked}
                    onChange={e => updateRow(rows, i, 'cgst', e.target.value, isBLTable)} />
                </td>
                <td style={tdStyle}>
                  <input style={{ ...inputSmall, width: 65, background: (hasIgst || locked) ? disabledBg : '#fff' }} type="number" placeholder="SGST" value={row.sgst} disabled={hasIgst || locked}
                    onChange={e => updateRow(rows, i, 'sgst', e.target.value, isBLTable)} />
                </td>
                <td style={tdStyle}>
                  <input style={{ ...inputSmall, width: 65, background: (hasCgstSgst || locked) ? disabledBg : '#fff' }} type="number" placeholder="IGST" value={row.igst} disabled={hasCgstSgst || locked}
                    onChange={e => updateRow(rows, i, 'igst', e.target.value, isBLTable)} />
                </td>
                <td style={tdStyle}>
                  <select style={{ ...inputSmall, width: 80, background: locked ? disabledBg : '#fff' }} value={row.tpVendorCode} disabled={locked} onChange={e => updateRow(rows, i, 'tpVendorCode', e.target.value, isBLTable)}>
                    <option value="">Select...</option>
                    {TP_VENDOR_OPTIONS.map(v => <option key={v.code} value={v.code}>{v.code}</option>)}
                  </select>
                </td>
                <td style={{ ...tdStyle, fontSize: 10, color: '#666' }}>{row.tpVendorName || '—'}</td>
                <td style={tdStyle}><button style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #999', borderRadius: 3, background: '#fff', cursor: 'pointer' }}>Upload</button></td>
                <td style={{ ...tdStyle, color: row.selected ? '#006EC3' : '#999', fontWeight: 600, fontSize: 10 }}>{row.selected ? statusText : '—'}</td>
                {hasApproverData && <td style={tdStyle}><ApproverCell action={row.approverAction} remark={row.approverRemark} /></td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>
        {charge.chargeName}
        <span style={{ fontSize: 10, fontWeight: 400, color: '#999', marginLeft: 8 }}>({isBL ? 'BL Level' : 'Container Level'})</span>
      </div>

      {isBL ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>BL-wise</div>
          {renderTable(charge.blRows, true, toggleBL)}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>BL Total: USD {total.toFixed(2)}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Container-wise</div>
          {renderTable(charge.containerRows, false, toggleCN)}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'right' }}>Container Total: USD {total.toFixed(2)}</div>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════

const IncidentalChargesView: React.FC<Props> = ({ taskName, onClose, onSendForApproval, savedDraft, onSaveDraft, submitted }) => {
  const [selectedCharges, setSelectedCharges] = useState<Array<{ name: string; type: ChargeType }>>(
    savedDraft?.selectedCharges || [{ name: '', type: 'Incidental' }]
  );
  const [phase, setPhase] = useState<'selection' | 'detail'>('selection');
  const [chargeData, setChargeData] = useState<ChargeData[]>(savedDraft?.chargeData || []);
  const [wasSentForApproval, setWasSentForApproval] = useState(savedDraft?.sentForApproval || false);
  const [activeChargeTab, setActiveChargeTab] = useState<ChargeType>('Incidental');
  const [validationError, setValidationError] = useState<string | null>(null);

  // For CHA tasks: store original pre-filled rates to enforce max validation (keyed by chargeName:rowId)
  const isCHA = taskName.startsWith('CHA');
  const originalRatesRef = useRef<Record<string, { rate?: string; basicValue?: string }>>({});

  // Helper: pre-fill BL/Container rows for CHA Self-Reimb and Third-Party
  const prefillCHARows = (chargeName: string, chargeType: ChargeType, level: ChargeLevel) => {
    let blRows = level === 'BL' ? createSingleBLRow() : [];
    let containerRows = level === 'Container' ? createDemoContainerRows() : [];

    if (chargeType === 'Self-Reimbursement') {
      const rates = CHA_SELF_REIMB_RATES[chargeName];
      if (rates) {
        blRows = blRows.map(r => ({ ...r, selected: true, rate: rates.blRate ? String(rates.blRate) : '' }));
        containerRows = containerRows.map(r => ({ ...r, selected: true, rate: rates.containerRate ? String(rates.containerRate) : '' }));
      }
    } else if (chargeType === 'Third-Party Reimbursement') {
      const prefill = CHA_THIRD_PARTY_PREFILL[chargeName];
      if (prefill?.blPrefill) {
        const p = prefill.blPrefill;
        const invoiceValue = String(parseFloat(p.basicValue) + (parseFloat(p.cgst) || 0) + (parseFloat(p.sgst) || 0) + (parseFloat(p.igst) || 0));
        blRows = blRows.map(r => ({ ...r, selected: true, tpInvoiceNo: p.tpInvoiceNo, tpInvoiceDate: p.tpInvoiceDate, tpInvoiceValue: invoiceValue, basicValue: p.basicValue, cgst: p.cgst, sgst: p.sgst, igst: p.igst, tpVendorCode: p.tpVendorCode, tpVendorName: p.tpVendorName }));
      }
      if (prefill?.containerPrefill) {
        const p = prefill.containerPrefill;
        const invoiceValue = String(parseFloat(p.basicValue) + (parseFloat(p.cgst) || 0) + (parseFloat(p.sgst) || 0) + (parseFloat(p.igst) || 0));
        containerRows = containerRows.map(r => ({ ...r, selected: true, tpInvoiceNo: p.tpInvoiceNo, tpInvoiceDate: p.tpInvoiceDate, tpInvoiceValue: invoiceValue, basicValue: p.basicValue, cgst: p.cgst, sgst: p.sgst, igst: p.igst, tpVendorCode: p.tpVendorCode, tpVendorName: p.tpVendorName }));
      }
    }
    return { blRows, containerRows };
  };

  // Build charge data from selections
  const buildChargeData = () => {
    const data: ChargeData[] = selectedCharges
      .filter(c => c.name)
      .map(c => {
        // Check if existing data for this charge
        const existing = chargeData.find(d => d.chargeName === c.name);
        if (existing) return existing;
        const level = CHARGE_LEVEL_MAP[c.name] || 'BL';

        // CHA: pre-fill Self-Reimb and Third-Party from CHA mappings
        if (isCHA && (c.type === 'Self-Reimbursement' || c.type === 'Third-Party Reimbursement')) {
          const { blRows, containerRows } = prefillCHARows(c.name, c.type, level);
          return { chargeName: c.name, chargeType: c.type, chargeLevel: level, blRows, containerRows };
        }

        return {
          chargeName: c.name,
          chargeType: c.type,
          chargeLevel: level,
          blRows: level === 'BL' ? createSingleBLRow() : [],
          containerRows: level === 'Container' ? createDemoContainerRows() : [],
        };
      });

    // Store original max values for CHA validation
    if (isCHA) {
      const map: Record<string, { rate?: string; basicValue?: string }> = {};
      data.forEach(c => {
        [...c.blRows, ...c.containerRows].forEach(r => {
          const key = `${c.chargeName}:${r.id}`;
          if (c.chargeType === 'Self-Reimbursement' && r.rate) {
            map[key] = { rate: r.rate };
          } else if (c.chargeType === 'Third-Party Reimbursement' && (r as any).basicValue) {
            map[key] = { basicValue: (r as any).basicValue };
          }
        });
      });
      originalRatesRef.current = map;
    }

    setChargeData(data);
    setPhase('detail');
  };

  const updateChargeData = (idx: number, updated: ChargeData) => {
    // CHA validation: Self-Reimb rate and Third-Party basicValue cannot exceed original
    if (isCHA && (updated.chargeType === 'Self-Reimbursement' || updated.chargeType === 'Third-Party Reimbursement')) {
      const allRows = [...updated.blRows, ...updated.containerRows];
      for (const row of allRows) {
        const key = `${updated.chargeName}:${row.id}`;
        const orig = originalRatesRef.current[key];
        if (!orig) continue;
        if (updated.chargeType === 'Self-Reimbursement' && orig.rate) {
          const newVal = parseFloat(row.rate) || 0;
          const maxVal = parseFloat(orig.rate) || 0;
          if (newVal > maxVal) {
            setValidationError(`Not valid, please fill correct amount. Maximum allowed: ${orig.rate}`);
            return;
          }
        }
        if (updated.chargeType === 'Third-Party Reimbursement' && orig.basicValue) {
          const newVal = parseFloat((row as any).basicValue) || 0;
          const maxVal = parseFloat(orig.basicValue) || 0;
          if (newVal > maxVal) {
            setValidationError(`Not valid, please fill correct amount. Maximum allowed: ${orig.basicValue}`);
            return;
          }
        }
      }
    }
    setValidationError(null);
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

  // Category totals + grand total — computed live as values change
  const { incidentalTotal, selfReimbTotal, thirdPartyTotal, grandTotal } = useMemo(() => {
    let incidentalTotal = 0;
    let selfReimbTotal = 0;
    let thirdPartyTotal = 0;
    chargeData.forEach(c => {
      const rates = INCIDENTAL_RATES[c.chargeName];
      const rows = c.chargeLevel === 'BL' ? c.blRows : c.containerRows;
      const selectedRows = rows.filter(r => r.selected);
      if (c.chargeType === 'Incidental' && rates) {
        const rate = c.chargeLevel === 'BL' ? rates.blRate : rates.containerRate;
        incidentalTotal += selectedRows.length * rate;
      } else if (c.chargeType === 'Self-Reimbursement') {
        selfReimbTotal += selectedRows.reduce((s, r) => s + (parseFloat(r.rate) || 0), 0);
      } else if (c.chargeType === 'Third-Party Reimbursement') {
        thirdPartyTotal += selectedRows.reduce((s, r) => s + (parseFloat(r.tpInvoiceValue) || 0), 0);
      }
    });
    return { incidentalTotal, selfReimbTotal, thirdPartyTotal, grandTotal: incidentalTotal + selfReimbTotal + thirdPartyTotal };
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
        {submitted && (
          <div style={{
            margin: '12px 16px 0', padding: '8px 14px',
            background: '#D3FFEA', color: '#0F6E3C',
            borderRadius: 6, fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            &#10003; Submitted
          </div>
        )}
        {(() => {
          const hasApproverResponse = savedDraft?.chargeData?.some(c =>
            [...(c.blRows || []), ...(c.containerRows || [])].some(r => r.approverAction)
          );
          return (
            <>
              <ChargeSelectionScreen
                charges={selectedCharges}
                onChange={setSelectedCharges}
                onSubmit={buildChargeData}
                onCancel={onClose}
                locked={hasApproverResponse}
              />
              {savedDraft && savedDraft.phase === 'detail' && (
                <div style={{ padding: '0 20px 20px' }}>
                  <button
                    onClick={() => { setChargeData(savedDraft.chargeData); setPhase('detail'); }}
                    style={{
                      background: hasApproverResponse ? '#FFF3E0' : '#E3F2FD',
                      color: hasApproverResponse ? '#E65100' : '#006EC3',
                      border: `1px solid ${hasApproverResponse ? '#FFCC80' : '#BBDEFB'}`,
                      borderRadius: 4, padding: '8px 16px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {hasApproverResponse ? 'View Approver Response' : 'Show Draft'}
                  </button>
                </div>
              )}
            </>
          );
        })()}
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

      {validationError && (
        <div style={{ margin: '8px 16px 0', padding: '8px 12px', background: '#FFF3E0', border: '1px solid #E65100', borderRadius: 4, color: '#E65100', fontSize: 11, fontWeight: 600 }}>
          {validationError}
        </div>
      )}

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

        {/* Category Totals + Grand Total */}
        <div style={{
          borderTop: '2px solid #e0e0e0', paddingTop: 16, marginTop: 8,
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end',
        }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 10, color: '#E65100', fontWeight: 600, marginBottom: 4 }}>Incidental</div>
            <div style={{
              background: incidentalTotal > 0 ? '#FFF3E0' : '#F5F5F5', borderRadius: 4, padding: '8px 12px',
              fontSize: 14, fontWeight: 700, color: incidentalTotal > 0 ? '#E65100' : '#999',
              border: '1px solid ' + (incidentalTotal > 0 ? '#FFCC80' : '#E8E8E8'),
            }}>
              USD {incidentalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 600, marginBottom: 4 }}>Self-Reimbursement</div>
            <div style={{
              background: selfReimbTotal > 0 ? '#E3F2FD' : '#F5F5F5', borderRadius: 4, padding: '8px 12px',
              fontSize: 14, fontWeight: 700, color: selfReimbTotal > 0 ? '#1565C0' : '#999',
              border: '1px solid ' + (selfReimbTotal > 0 ? '#90CAF9' : '#E8E8E8'),
            }}>
              USD {selfReimbTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 10, color: '#2E7D32', fontWeight: 600, marginBottom: 4 }}>Third-Party Reimbursement</div>
            <div style={{
              background: thirdPartyTotal > 0 ? '#E8F5E9' : '#F5F5F5', borderRadius: 4, padding: '8px 12px',
              fontSize: 14, fontWeight: 700, color: thirdPartyTotal > 0 ? '#2E7D32' : '#999',
              border: '1px solid ' + (thirdPartyTotal > 0 ? '#A5D6A7' : '#E8E8E8'),
            }}>
              USD {thirdPartyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 170 }}>
            <div style={{ fontSize: 10, color: '#333', fontWeight: 700, marginBottom: 4 }}>Grand Total</div>
            <div style={{
              background: grandTotal > 0 ? '#333' : '#F5F5F5', borderRadius: 4, padding: '8px 12px',
              fontSize: 16, fontWeight: 700, color: grandTotal > 0 ? '#fff' : '#999',
            }}>
              USD {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentalChargesView;
