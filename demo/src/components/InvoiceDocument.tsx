import React from 'react';

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

export interface InvoiceLineItem {
  sno: number;
  chargeDetails: string;
  hsnSac: string;
  currency: string;
  rate: string;
  unit: string;
  taxableAmt: string;
  taxRate: string;
  cgst: string;
  sgst: string;
  igst: string;
  total: string;
}

export interface InvoiceData {
  vendorType: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  irn: string;
  ackNumber: string;
  seller: { name: string; gstin: string; address: string; email: string };
  purchaser: { name: string; gstin: string; address: string; stateCode: string };
  lineItems: InvoiceLineItem[];
  taxSummary: Array<{ hsnSac: string; taxableAmt: string; rate: string; cgst: string; sgst: string; igst: string; total: string }>;
  totalTaxable: string;
  totalTax: string;
  grandTotal: string;
  grandTotalWords: string;
}

interface Props {
  data: InvoiceData;
  onClose: () => void;
}

// ════════════════════════════════════════════════════
// Dummy QR Code SVG
// ════════════════════════════════════════════════════

const DummyQR: React.FC<{ size?: number }> = ({ size = 90 }) => {
  // Generate a deterministic pattern that looks like a QR code
  const modules = 21;
  const pattern = [
    // Finder patterns (top-left, top-right, bottom-left)
    ...generateFinderPattern(0, 0),
    ...generateFinderPattern(14, 0),
    ...generateFinderPattern(0, 14),
    // Random-ish data modules
    ...generateDataModules(),
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${modules} ${modules}`} style={{ border: '1px solid #ddd' }}>
      <rect width={modules} height={modules} fill="white" />
      {pattern.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill="black" />
      ))}
    </svg>
  );
};

function generateFinderPattern(ox: number, oy: number) {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
      const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      if (isOuter || isInner) cells.push({ x: ox + j, y: oy + i });
    }
  }
  return cells;
}

function generateDataModules() {
  const cells: { x: number; y: number }[] = [];
  const seed = [3, 7, 11, 5, 13, 9, 2, 15, 8, 14, 6, 10, 1, 12, 4];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      // Skip finder pattern areas
      if (x < 8 && y < 8) continue;
      if (x >= 13 && y < 8) continue;
      if (x < 8 && y >= 13) continue;
      // Timing patterns
      if (x === 6 || y === 6) {
        if ((x + y) % 2 === 0) cells.push({ x, y });
        continue;
      }
      // Data pattern
      if ((seed[(x * 3 + y * 7) % seed.length] + x + y) % 3 === 0) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

// ════════════════════════════════════════════════════
// Generate 64-digit IRN
// ════════════════════════════════════════════════════

export function generateIRN(): string {
  const chars = '0123456789abcdef';
  let irn = '';
  for (let i = 0; i < 64; i++) {
    irn += chars[Math.floor(Math.random() * chars.length)];
  }
  return irn;
}

// ════════════════════════════════════════════════════
// Generate Ack Number
// ════════════════════════════════════════════════════

export function generateAckNumber(): string {
  let num = '';
  for (let i = 0; i < 18; i++) {
    num += Math.floor(Math.random() * 10).toString();
  }
  return num;
}

// ════════════════════════════════════════════════════
// Number to words (simplified)
// ════════════════════════════════════════════════════

function numberToWords(n: number): string {
  if (n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rem = Math.floor(n % 100);

  let result = '';
  if (crore > 0) result += twoDigit(crore) + ' Crore(s) ';
  if (lakh > 0) result += twoDigit(lakh) + ' Lakh(s) ';
  if (thousand > 0) result += twoDigit(thousand) + ' Thousand ';
  if (hundred > 0) result += ones[hundred] + ' Hundred ';
  if (rem > 0) {
    if (result) result += 'and ';
    result += twoDigit(rem);
  }
  return result.trim() + ' INDIAN RUPEES Only';

  function twoDigit(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }
}

export { numberToWords };

// ════════════════════════════════════════════════════
// Styles
// ════════════════════════════════════════════════════

const border = '1px solid #333';
const cellStyle: React.CSSProperties = {
  padding: '4px 6px', fontSize: 9, borderRight: border, borderBottom: border, verticalAlign: 'top',
};
const headerCellStyle: React.CSSProperties = {
  ...cellStyle, fontWeight: 700, background: '#F0F0F0', fontSize: 8, textAlign: 'center',
};

// ════════════════════════════════════════════════════
// Invoice Document Component
// ════════════════════════════════════════════════════

const InvoiceDocument: React.FC<Props> = ({ data, onClose }) => {
  const now = new Date();
  const ackDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflowY: 'auto', padding: '20px 0',
    }}>
      <div style={{
        background: '#fff', width: 680, minHeight: 960, borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        border: '1px solid #ccc',
      }}>
        {/* Close + Print buttons */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '8px 12px',
          borderBottom: '1px solid #eee', background: '#fff',
        }}>
          <button
            onClick={() => window.print()}
            style={{
              height: 30, padding: '0 16px', background: '#006EC3', color: '#fff',
              border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Print / Download PDF
          </button>
          <button
            onClick={onClose}
            style={{
              height: 30, padding: '0 12px', background: '#fff', color: '#333',
              border: '1px solid #999', borderRadius: 4, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >&#10005;</button>
        </div>

        {/* Invoice content */}
        <div id="invoice-print-area" style={{ padding: '20px 28px 30px', fontFamily: "'Open Sans', Arial, sans-serif", color: '#222' }}>
          {/* Header row: Logo + Company + QR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src="/shipsy-logo.jpg" alt="Shipsy" style={{ height: 36, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#333' }}>{data.seller.name}</div>
                <div style={{ fontSize: 8, color: '#666', maxWidth: 350, lineHeight: '1.4' }}>{data.seller.address}</div>
                <div style={{ fontSize: 8, color: '#666' }}>GST ID: {data.seller.gstin}</div>
              </div>
            </div>
            <DummyQR size={80} />
          </div>

          {/* TAX INVOICE title */}
          <div style={{ textAlign: 'center', margin: '10px 0 6px' }}>
            <span style={{
              fontSize: 14, fontWeight: 800, color: '#333', border: '2px solid #333',
              padding: '3px 20px', letterSpacing: 1,
            }}>TAX INVOICE</span>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#666', marginTop: 4 }}>ORIGINAL FOR RECIPIENT</div>
          </div>

          {/* e-Invoice Details */}
          <div style={{ border, padding: '6px 10px', marginBottom: 8, background: '#F8F8F8' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#444', marginBottom: 4, background: '#E0E0E0', padding: '2px 6px', display: 'inline-block' }}>e-Invoice Details</div>
            <div style={{ fontSize: 8, color: '#333' }}>
              <b>IRN:</b> {data.irn}
            </div>
            <div style={{ fontSize: 8, color: '#333' }}>
              <b>Acknowledge Number:</b> {data.ackNumber} &nbsp;&nbsp; <b>Acknowledge Date:</b> {ackDate}
            </div>
          </div>

          {/* Transaction Details */}
          <div style={{ border, marginBottom: 8, background: '#F8F8F8' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#444', background: '#E0E0E0', padding: '2px 6px' }}>Transactions details</div>
            <div style={{ display: 'flex', fontSize: 8, padding: '4px 10px', gap: 20 }}>
              <span>Category: <b>B2B</b></span>
              <span>Document number: <b>{data.invoiceNumber}</b></span>
              <span>Document Date: <b>{data.invoiceDate}</b></span>
              <span>IGST on INTRA: <b>No</b></span>
            </div>
          </div>

          {/* Party details — Seller | Purchaser */}
          <div style={{ border, marginBottom: 8, background: '#F8F8F8' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#444', background: '#E0E0E0', padding: '2px 6px' }}>Party details</div>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, padding: '6px 10px', borderRight: border }}>
                <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 3 }}>Seller</div>
                <div style={{ fontSize: 8, lineHeight: '1.5', color: '#333' }}>
                  GSTIN: {data.seller.gstin}<br />
                  Company<br />
                  {data.seller.name}<br />
                  {data.seller.address}<br />
                  email: {data.seller.email}
                </div>
              </div>
              <div style={{ flex: 1, padding: '6px 10px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 3 }}>Purchaser</div>
                <div style={{ fontSize: 8, lineHeight: '1.5', color: '#333' }}>
                  GSTIN: {data.purchaser.gstin}<br />
                  {data.purchaser.name}<br />
                  {data.purchaser.address}<br />
                  POS: Gujarat<br />
                  State code: {data.purchaser.stateCode}
                </div>
              </div>
            </div>
          </div>

          {/* Goods / Charge Details Table */}
          <div style={{ border, marginBottom: 8, background: '#F8F8F8' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#444', background: '#E0E0E0', padding: '2px 6px' }}>Goods details</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...headerCellStyle, width: 25 }}>SINo</th>
                  <th style={headerCellStyle}>Product description</th>
                  <th style={{ ...headerCellStyle, width: 50 }}>HSN Code</th>
                  <th style={{ ...headerCellStyle, width: 40 }}>Qty</th>
                  <th style={{ ...headerCellStyle, width: 55 }}>Unit Price (Rs)</th>
                  <th style={{ ...headerCellStyle, width: 50 }}>Taxable Amount (Rs)</th>
                  <th style={{ ...headerCellStyle, width: 70 }}>Tax Rate (GST+Cess)</th>
                  <th style={{ ...headerCellStyle, width: 50 }}>Other Charges</th>
                  <th style={{ ...headerCellStyle, width: 60, borderRight: 'none' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item) => (
                  <tr key={item.sno}>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>{item.sno}</td>
                    <td style={cellStyle}>{item.chargeDetails}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>{item.hsnSac}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{item.unit}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{item.rate}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{item.taxableAmt}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>{item.taxRate}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>0.00</td>
                    <td style={{ ...cellStyle, textAlign: 'right', borderRight: 'none' }}>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Summary */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <table style={{ flex: 1, borderCollapse: 'collapse', border }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Taxable Amount</th>
                  <th style={headerCellStyle}>CGST Amount</th>
                  <th style={headerCellStyle}>SGST Amount</th>
                  <th style={headerCellStyle}>IGST Amount</th>
                  <th style={headerCellStyle}>CESS Amount</th>
                  <th style={headerCellStyle}>Discount</th>
                  <th style={{ ...headerCellStyle, borderRight: 'none' }}>Total Invoice Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{data.totalTaxable}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{data.taxSummary.reduce((s, r) => s + (parseFloat(r.cgst) || 0), 0).toFixed(2)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{data.taxSummary.reduce((s, r) => s + (parseFloat(r.sgst) || 0), 0).toFixed(2)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{data.taxSummary.reduce((s, r) => s + (parseFloat(r.igst) || 0), 0).toFixed(2)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>0.00</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>0.00</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 700, fontSize: 10, borderRight: 'none' }}>{data.grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in words */}
          <div style={{ fontSize: 9, fontWeight: 600, color: '#333', marginBottom: 10, fontStyle: 'italic' }}>
            {data.grandTotalWords}
          </div>

          {/* Creation date + footer */}
          <div style={{ fontSize: 8, color: '#666', marginBottom: 16 }}>
            Creation date: {ackDate}
          </div>

          {/* Signature block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: border, paddingTop: 12 }}>
            <div style={{ fontSize: 8, color: '#666', maxWidth: 400, lineHeight: '1.5' }}>
              <b>Terms:</b><br />
              1. Any discrepancy must be notified in writing within seven days of invoice date.<br />
              2. Invoices not paid within stipulated credit period will be subject to interest charges of 18% per annum.<br />
              3. This is a computer generated document.
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#333', marginBottom: 4 }}>For {data.seller.name}</div>
              <div style={{ fontSize: 8, color: '#999', fontStyle: 'italic' }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDocument;
