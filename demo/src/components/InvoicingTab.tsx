import React, { useState } from 'react';

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

interface ShipmentCharges {
  id: string;
  asnNumber: string;
  shipmentMode: string;
  incoterm: string;
  spotOrTender: 'Spot' | 'Tender';
  origin: string;
  destination: string;
  vendor: string;
  contractualCharges: ChargeRow[];
  selfReimbCharges: ChargeRow[];
  thirdPartyCharges: TPChargeRow[];
}

interface CreatedInvoice {
  id: string;
  invoiceName: string;
  invoiceDate: string;
  asnNumber: string;
  chargeNames: string[];
  total: number;
  currency: string;
  createdAt: string;
  chargeType: string;
}

// ════════════════════════════════════════════════════
// Mock Data - 4 Shipments with charges (using real ASN numbers)
// ════════════════════════════════════════════════════

const shipmentCharges: ShipmentCharges[] = [
  {
    id: 's1',
    asnNumber: 'ASN-0001',
    shipmentMode: 'FCL',
    incoterm: 'FOB',
    spotOrTender: 'Tender',
    origin: 'INMUN',
    destination: 'INNSA',
    vendor: 'Liberty Forwarding',
    contractualCharges: [
      { id: 's1-c1', chargeName: 'Ocean Freight - 20ft', level: 'BL', vendorPrice: '1200.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '1200.00' },
      { id: 's1-c2', chargeName: 'Ocean Freight - 40ft', level: 'BL', vendorPrice: '1800.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '1800.00' },
      { id: 's1-c3', chargeName: 'THC Origin', level: 'Container', vendorPrice: '185.00', currency: 'USD', unitType: 'Per Container', units: '2.00', tax: '—', total: '370.00' },
      { id: 's1-c4', chargeName: 'Bill of Lading Fee', level: 'BL', vendorPrice: '50.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '50.00' },
    ],
    selfReimbCharges: [
      { id: 's1-sr1', chargeName: 'Documentation charges', level: 'BL', vendorPrice: '1500.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '1500.00' },
      { id: 's1-sr2', chargeName: 'Storage Fees', level: 'Container', vendorPrice: '450.00', currency: 'USD', unitType: 'Per Container', units: '2.00', tax: '—', total: '900.00' },
    ],
    thirdPartyCharges: [
      { id: 's1-tp1', chargeName: 'Agency charges', level: 'BL', vendorPrice: '654.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '18% GST', total: '654.00', invoiceNo: 'TP-INV-001', invoiceDate: '2026-03-15', basicValue: '600.00', cgst: '27.00', sgst: '27.00', igst: '0.00', vendorCode: 'VND001', vendorName: 'Clear Cargo Pvt Ltd' },
      { id: 's1-tp2', chargeName: 'License charges', level: 'Container', vendorPrice: '413.00', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '413.00', invoiceNo: 'TP-INV-002', invoiceDate: '2026-03-18', basicValue: '350.00', cgst: '0.00', sgst: '0.00', igst: '63.00', vendorCode: 'VND002', vendorName: 'FastTrack Logistics' },
    ],
  },
  {
    id: 's2',
    asnNumber: 'ASN-0002',
    shipmentMode: 'FCL',
    incoterm: 'EXW',
    spotOrTender: 'Spot',
    origin: 'THLKR',
    destination: 'KRPUS',
    vendor: 'Liberty Forwarding',
    contractualCharges: [
      { id: 's2-c1', chargeName: 'Ocean Freight - 40ft', level: 'BL', vendorPrice: '2200.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '2200.00' },
      { id: 's2-c2', chargeName: 'THC Origin', level: 'Container', vendorPrice: '195.00', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '—', total: '195.00' },
      { id: 's2-c3', chargeName: 'Seal charges', level: 'Container', vendorPrice: '25.00', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '—', total: '25.00' },
    ],
    selfReimbCharges: [
      { id: 's2-sr1', chargeName: 'Handling Charges', level: 'BL', vendorPrice: '800.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '800.00' },
    ],
    thirdPartyCharges: [
      { id: 's2-tp1', chargeName: 'Registration charges', level: 'Container', vendorPrice: '472.00', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '472.00', invoiceNo: 'TP-INV-003', invoiceDate: '2026-02-20', basicValue: '400.00', cgst: '36.00', sgst: '36.00', igst: '0.00', vendorCode: 'VND003', vendorName: 'SafeShip Services' },
    ],
  },
  {
    id: 's3',
    asnNumber: 'ASN-0003',
    shipmentMode: 'FCL',
    incoterm: 'FOB',
    spotOrTender: 'Tender',
    origin: 'CNSGN',
    destination: 'INNSA',
    vendor: 'Liberty Forwarding',
    contractualCharges: [
      { id: 's3-c1', chargeName: 'Ocean Freight - 20ft', level: 'BL', vendorPrice: '950.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '950.00' },
      { id: 's3-c2', chargeName: 'THC Origin', level: 'BL', vendorPrice: '120.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '—', total: '120.00' },
    ],
    selfReimbCharges: [
      { id: 's3-sr1', chargeName: 'Special equipment charges', level: 'Container', vendorPrice: '750.00', currency: 'USD', unitType: 'Per Unit', units: '1.00', tax: '—', total: '750.00' },
    ],
    thirdPartyCharges: [
      { id: 's3-tp1', chargeName: 'Fumigation charges', level: 'BL', vendorPrice: '236.00', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '18% GST', total: '236.00', invoiceNo: 'TP-INV-004', invoiceDate: '2026-01-10', basicValue: '200.00', cgst: '18.00', sgst: '18.00', igst: '0.00', vendorCode: 'VND003', vendorName: 'SafeShip Services' },
    ],
  },
  {
    id: 's4',
    asnNumber: 'ASN-0008',
    shipmentMode: 'AIR',
    incoterm: 'CPT',
    spotOrTender: 'Spot',
    origin: 'INBOM',
    destination: 'USORD',
    vendor: 'Liberty Forwarding',
    contractualCharges: [
      { id: 's4-c1', chargeName: 'Air Freight', level: 'BL', vendorPrice: '4.50', currency: 'USD', unitType: 'Per Kg', units: '520.00', tax: '—', total: '2340.00' },
      { id: 's4-c2', chargeName: 'Fuel Surcharge', level: 'BL', vendorPrice: '380.00', currency: 'USD', unitType: 'Per AWB', units: '1.00', tax: '—', total: '380.00' },
      { id: 's4-c3', chargeName: 'Security Surcharge', level: 'BL', vendorPrice: '0.15', currency: 'USD', unitType: 'Per Kg', units: '520.00', tax: '—', total: '78.00' },
    ],
    selfReimbCharges: [
      { id: 's4-sr1', chargeName: 'Transport Fee', level: 'BL', vendorPrice: '320.00', currency: 'USD', unitType: 'Per AWB', units: '1.00', tax: '—', total: '320.00' },
      { id: 's4-sr2', chargeName: 'Documentation charges', level: 'BL', vendorPrice: '600.00', currency: 'USD', unitType: 'Per AWB', units: '1.00', tax: '—', total: '600.00' },
    ],
    thirdPartyCharges: [
      { id: 's4-tp1', chargeName: 'Customs exam fees', level: 'BL', vendorPrice: '590.00', currency: 'USD', unitType: 'Per AWB', units: '1.00', tax: '18% GST', total: '590.00', invoiceNo: 'TP-INV-005', invoiceDate: '2026-04-01', basicValue: '500.00', cgst: '45.00', sgst: '45.00', igst: '0.00', vendorCode: 'VND004', vendorName: 'Express Customs Ltd' },
      { id: 's4-tp2', chargeName: 'Inspection fees', level: 'BL', vendorPrice: '354.00', currency: 'USD', unitType: 'Per AWB', units: '1.00', tax: '18% GST', total: '354.00', invoiceNo: 'TP-INV-006', invoiceDate: '2026-04-02', basicValue: '300.00', cgst: '0.00', sgst: '0.00', igst: '54.00', vendorCode: 'VND001', vendorName: 'Clear Cargo Pvt Ltd' },
    ],
  },
];

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
  padding: '0 10px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const greyRowStyle: React.CSSProperties = { background: '#F0F0F0', opacity: 0.5, pointerEvents: 'none' as const };

type ChargeTab = 'contractual' | 'self-reimb' | 'third-party';

// ════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════

const InvoicingTab: React.FC = () => {
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);
  const [activeChargeTab, setActiveChargeTab] = useState<Record<string, ChargeTab>>({});
  const [invoiceName, setInvoiceName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');

  // Checked charges per shipment
  const [checkedCharges, setCheckedCharges] = useState<Record<string, Set<string>>>({});
  // Greyed (already invoiced) charges
  const [greyedCharges, setGreyedCharges] = useState<Record<string, Set<string>>>({});
  // Created invoices list
  const [createdInvoices, setCreatedInvoices] = useState<CreatedInvoice[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedShipment(prev => prev === id ? null : id);
    if (!activeChargeTab[id]) {
      setActiveChargeTab(prev => ({ ...prev, [id]: 'contractual' }));
    }
  };

  const getChecked = (shipmentId: string): Set<string> => checkedCharges[shipmentId] || new Set();
  const getGreyed = (shipmentId: string): Set<string> => greyedCharges[shipmentId] || new Set();

  const toggleCheck = (shipmentId: string, chargeId: string, tab: ChargeTab) => {
    setCheckedCharges(prev => {
      const set = new Set(prev[shipmentId] || []);
      if (tab === 'third-party') {
        // Third-party: single select only — clear all TP selections then toggle
        const shipment = shipmentCharges.find(s => s.id === shipmentId)!;
        shipment.thirdPartyCharges.forEach(r => set.delete(r.id));
        if (!prev[shipmentId]?.has(chargeId)) {
          set.add(chargeId);
        }
      } else {
        set.has(chargeId) ? set.delete(chargeId) : set.add(chargeId);
      }
      return { ...prev, [shipmentId]: set };
    });
  };

  const toggleAllForTab = (shipment: ShipmentCharges, tab: ChargeTab) => {
    // No select-all for third-party
    if (tab === 'third-party') return;
    const rows = getRowsForTab(shipment, tab);
    const greyed = getGreyed(shipment.id);
    const selectable = rows.filter(r => !greyed.has(r.id)).map(r => r.id);
    const checked = getChecked(shipment.id);
    const allChecked = selectable.length > 0 && selectable.every(id => checked.has(id));
    setCheckedCharges(prev => {
      const set = new Set(prev[shipment.id] || []);
      if (allChecked) {
        selectable.forEach(id => set.delete(id));
      } else {
        selectable.forEach(id => set.add(id));
      }
      return { ...prev, [shipment.id]: set };
    });
  };

  const getRowsForTab = (shipment: ShipmentCharges, tab: ChargeTab): (ChargeRow | TPChargeRow)[] => {
    if (tab === 'contractual') return shipment.contractualCharges;
    if (tab === 'self-reimb') return shipment.selfReimbCharges;
    return shipment.thirdPartyCharges;
  };

  const handleCreateInvoice = (shipment: ShipmentCharges) => {
    if (!invoiceName.trim() || !invoiceDate.trim()) return;
    const checked = getChecked(shipment.id);
    if (checked.size === 0) return;

    const tab = activeChargeTab[shipment.id] || 'contractual';
    const rows = getRowsForTab(shipment, tab);
    const selectedRows = rows.filter(r => checked.has(r.id));
    if (selectedRows.length === 0) return;

    const total = selectedRows.reduce((s, r) => s + parseFloat(r.total), 0);
    const tabLabel = tab === 'contractual' ? 'Contractual & Incidental' : tab === 'self-reimb' ? 'Self-Reimbursement' : 'Third-Party Reimbursement';

    const newInvoice: CreatedInvoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      invoiceName: invoiceName.trim(),
      invoiceDate,
      asnNumber: shipment.asnNumber,
      chargeNames: selectedRows.map(r => r.chargeName),
      total,
      currency: selectedRows[0]?.currency || 'USD',
      createdAt: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      chargeType: tabLabel,
    };

    setCreatedInvoices(prev => [newInvoice, ...prev]);

    // Grey out the selected charges
    setGreyedCharges(prev => {
      const set = new Set(prev[shipment.id] || []);
      checked.forEach(id => {
        if (rows.some(r => r.id === id)) set.add(id);
      });
      return { ...prev, [shipment.id]: set };
    });

    // Clear selections
    setCheckedCharges(prev => {
      const set = new Set(prev[shipment.id] || []);
      rows.forEach(r => set.delete(r.id));
      return { ...prev, [shipment.id]: set };
    });
    setInvoiceName('');
    setInvoiceDate('');
  };

  const getSelectedTotal = (shipment: ShipmentCharges): number => {
    const checked = getChecked(shipment.id);
    const tab = activeChargeTab[shipment.id] || 'contractual';
    const rows = getRowsForTab(shipment, tab);
    return rows.filter(r => checked.has(r.id)).reduce((s, r) => s + parseFloat(r.total), 0);
  };

  const getSelectedCount = (shipment: ShipmentCharges): number => {
    const checked = getChecked(shipment.id);
    const tab = activeChargeTab[shipment.id] || 'contractual';
    const rows = getRowsForTab(shipment, tab);
    return rows.filter(r => checked.has(r.id)).length;
  };

  const chargeTabs: { key: ChargeTab; label: string; color: string }[] = [
    { key: 'contractual', label: 'Contractual & Incidental Charges', color: '#E65100' },
    { key: 'self-reimb', label: 'Self-Reimbursement Charges', color: '#1565C0' },
    { key: 'third-party', label: 'Third-Party Reimbursement Charges', color: '#2E7D32' },
  ];

  return (
    <div className="invoicing-tab-root">
      {/* Left Panel - Shipment Line Items */}
      <div className="invoicing-left-panel">
        <div className="invoicing-panel-header">
          <span style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>Shipment Charges</span>
          <span style={{ fontSize: 12, color: '#666' }}>{shipmentCharges.length} shipments</span>
        </div>

        {shipmentCharges.map(shipment => {
          const isExpanded = expandedShipment === shipment.id;
          const tab = activeChargeTab[shipment.id] || 'contractual';
          const isTP = tab === 'third-party';
          const rows = getRowsForTab(shipment, tab);
          const checked = getChecked(shipment.id);
          const greyed = getGreyed(shipment.id);
          const totalCharges = shipment.contractualCharges.length + shipment.selfReimbCharges.length + shipment.thirdPartyCharges.length;
          const totalGreyed = [...shipment.contractualCharges, ...shipment.selfReimbCharges, ...shipment.thirdPartyCharges].filter(r => greyed.has(r.id)).length;

          return (
            <div key={shipment.id} className={`invoicing-shipment-item ${isExpanded ? 'expanded' : ''}`}>
              {/* Line Item Header */}
              <div className="invoicing-line-item" onClick={() => toggleExpand(shipment.id)}>
                <div className="invoicing-line-left">
                  <span className="invoicing-expand-arrow">{isExpanded ? '▼' : '▶'}</span>
                  <div>
                    <div className="invoicing-asn">{shipment.asnNumber}</div>
                    <div className="invoicing-line-meta">
                      <span className="invoicing-mode-badge">{shipment.shipmentMode}</span>
                      <span>{shipment.origin} → {shipment.destination}</span>
                      <span style={{ color: '#999' }}>|</span>
                      <span style={{ fontWeight: 600 }}>{shipment.incoterm}</span>
                      <span style={{ color: '#999' }}>|</span>
                      <span className={`invoicing-spot-tender-badge ${shipment.spotOrTender === 'Spot' ? 'spot' : 'tender'}`}>
                        {shipment.spotOrTender}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="invoicing-line-right">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>{shipment.vendor}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      {totalGreyed}/{totalCharges} charges invoiced
                    </div>
                  </div>
                  {totalGreyed === totalCharges && totalCharges > 0 ? (
                    <span className="invoicing-status-done">All Done</span>
                  ) : totalGreyed > 0 ? (
                    <span className="invoicing-status-partial">Partial</span>
                  ) : (
                    <span className="invoicing-status-pending">Pending</span>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="invoicing-expanded-content">
                  {/* Invoice Name & Date Fields */}
                  <div className="invoicing-invoice-fields">
                    <div style={{ flex: 1, maxWidth: 260 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>Invoice Name <span style={{ color: '#E53935' }}>*</span></div>
                      <input
                        style={fieldInputStyle}
                        placeholder="Enter invoice name"
                        value={invoiceName}
                        onChange={e => setInvoiceName(e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div style={{ flex: 1, maxWidth: 200 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>Invoice Date <span style={{ color: '#E53935' }}>*</span></div>
                      <input
                        style={fieldInputStyle}
                        type="date"
                        value={invoiceDate}
                        onChange={e => setInvoiceDate(e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <button
                      className="invoicing-create-btn"
                      disabled={!invoiceName.trim() || !invoiceDate.trim() || getSelectedCount(shipment) === 0}
                      onClick={e => { e.stopPropagation(); handleCreateInvoice(shipment); }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Create Invoice
                    </button>
                  </div>

                  {getSelectedCount(shipment) > 0 && (
                    <div className="invoicing-selection-summary">
                      Selected: {getSelectedCount(shipment)} charge(s) — Total: {getSelectedTotal(shipment).toFixed(2)} USD
                    </div>
                  )}

                  {/* Charge Type Tabs */}
                  <div className="invoicing-charge-tabs">
                    {chargeTabs.map(t => {
                      const count = t.key === 'contractual' ? shipment.contractualCharges.length
                        : t.key === 'self-reimb' ? shipment.selfReimbCharges.length
                        : shipment.thirdPartyCharges.length;
                      return (
                        <button
                          key={t.key}
                          className={`invoicing-charge-tab ${tab === t.key ? 'active' : ''}`}
                          style={{
                            borderBottomColor: tab === t.key ? t.color : 'transparent',
                            color: tab === t.key ? t.color : '#666',
                          }}
                          onClick={e => { e.stopPropagation(); setActiveChargeTab(prev => ({ ...prev, [shipment.id]: t.key })); }}
                        >
                          {t.label}
                          {count > 0 && (
                            <span style={{
                              marginLeft: 6, fontSize: 10,
                              background: tab === t.key ? t.color : '#ccc',
                              color: '#fff', borderRadius: 8, padding: '1px 6px',
                            }}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Charge Table */}
                  {rows.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>
                      No {tab === 'contractual' ? 'contractual & incidental' : tab === 'self-reimb' ? 'self-reimbursement' : 'third-party reimbursement'} charges for this shipment
                    </div>
                  ) : isTP ? (
                    /* ═══ THIRD-PARTY TABLE (different columns, single select) ═══ */
                    <div className="invoicing-charge-table-wrap">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ ...thStyle, width: 30 }}>&#9744;</th>
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
                          {(rows as TPChargeRow[]).map((r, i) => {
                            const g = greyed.has(r.id);
                            return (
                              <tr key={r.id} style={g ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                <td style={tdStyle}>
                                  <input
                                    type="checkbox"
                                    checked={checked.has(r.id)}
                                    disabled={g}
                                    onChange={() => toggleCheck(shipment.id, r.id, 'third-party')}
                                  />
                                </td>
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
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderTop: '1px solid #E8E8E8' }}>
                        <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>Select one charge at a time for third-party invoicing</span>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>Total:</span>
                          <span style={{ background: '#F5F5F5', borderRadius: 4, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#333', border: '1px solid #E0E0E0' }}>
                            {rows.reduce((s, r) => s + parseFloat(r.total), 0).toFixed(2)} {rows[0]?.currency || 'USD'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ═══ CONTRACTUAL / SELF-REIMB TABLE ═══ */
                    <div className="invoicing-charge-table-wrap">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ ...thStyle, width: 30 }}>
                              <input
                                type="checkbox"
                                checked={rows.filter(r => !greyed.has(r.id)).length > 0 && rows.filter(r => !greyed.has(r.id)).every(r => checked.has(r.id))}
                                onChange={() => toggleAllForTab(shipment, tab)}
                                disabled={rows.filter(r => !greyed.has(r.id)).length === 0}
                              />
                            </th>
                            <th style={{ ...thStyle, width: 30 }}>#</th>
                            <th style={thStyle}>Charges</th>
                            <th style={thStyle}>Vendor's Price</th>
                            <th style={thStyle}>Currency</th>
                            <th style={thStyle}>Unit Type</th>
                            <th style={thStyle}>Units</th>
                            <th style={thStyle}>Tax</th>
                            <th style={thStyle}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => {
                            const g = greyed.has(r.id);
                            return (
                              <tr key={r.id} style={g ? greyRowStyle : { background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                <td style={tdStyle}>
                                  <input
                                    type="checkbox"
                                    checked={checked.has(r.id)}
                                    disabled={g}
                                    onChange={() => toggleCheck(shipment.id, r.id, tab)}
                                  />
                                </td>
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 12, alignItems: 'center', padding: '8px 10px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>Total:</span>
                        <span style={{ background: '#F5F5F5', borderRadius: 4, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#333', border: '1px solid #E0E0E0' }}>
                          {rows.reduce((s, r) => s + parseFloat(r.total), 0).toFixed(2)} {rows[0]?.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Panel - Created Invoices */}
      <div className="invoicing-right-panel">
        <div className="invoicing-right-header">
          <span>Invoice</span>
        </div>
        <div className="invoicing-right-header-bar" />

        {createdInvoices.length === 0 ? (
          <div className="invoicing-empty-pane">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D9D9D9" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#666', marginTop: 16 }}>No invoice to show.</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Please upload an invoice to preview.</div>
          </div>
        ) : (
          <div className="invoicing-invoice-list">
            {createdInvoices.map(inv => (
              <div key={inv.id} className="invoicing-invoice-entry">
                <div className="invoicing-invoice-entry-header">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{inv.invoiceName}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{inv.asnNumber}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#006EC3' }}>
                      {inv.currency} {inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{inv.invoiceDate}</div>
                  </div>
                </div>
                <div className="invoicing-invoice-entry-body">
                  <span className="invoicing-charge-type-tag">{inv.chargeType}</span>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                    {inv.chargeNames.join(', ')}
                  </div>
                </div>
                <div className="invoicing-invoice-entry-footer">
                  <span style={{ fontSize: 10, color: '#999' }}>Created: {inv.createdAt}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="invoicing-inv-action-link">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1875F0" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                    <button className="invoicing-inv-action-link">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1875F0" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicingTab;
