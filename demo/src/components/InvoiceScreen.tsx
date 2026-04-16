import React, { useState, useMemo, useEffect } from 'react';
import {
  payableInvoices,
  receivableInvoices,
  getStatusCounts,
  statusBadgeColors,
  statusDisplayNames,
  statusCardStyles,
  type Invoice,
  type InvoiceTab,
  type InvoiceStatus,
} from '../data/invoiceData';
import InvoicingTab from './InvoicingTab';

interface Props {
  onOpenMenu: () => void;
  defaultTab?: 'payables' | 'receivables' | 'invoicing';
}

type StatusFilter = 'ALL' | InvoiceStatus;

const payableStatusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'REVIEW_PENDING', label: 'Review Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DISPUTE_RAISED', label: 'Dispute Raised' },
  { key: 'PAID', label: 'Paid' },
  { key: 'SETTLED', label: 'Settled' },
];

const receivableStatusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'REVIEW_PENDING', label: 'Review Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DISPUTE_RAISED', label: 'Dispute Raised' },
  { key: 'RECEIVED', label: 'Received' },
  { key: 'SETTLED', label: 'Settled' },
];

const dateFilters = ['1W', '1M', '3M', 'CUSTOM'] as const;

const InvoiceScreen: React.FC<Props> = ({ onOpenMenu, defaultTab = 'payables' }) => {
  const [activeTab, setActiveTab] = useState<InvoiceTab>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
    setStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  }, [defaultTab]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [activeDateFilter, setActiveDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const allInvoices = activeTab === 'payables' ? payableInvoices : receivableInvoices;
  const statusTabs = activeTab === 'payables' ? payableStatusTabs : receivableStatusTabs;
  const counts = useMemo(() => getStatusCounts(allInvoices), [allInvoices]);

  const filteredInvoices = useMemo(() => {
    let list = allInvoices;
    if (statusFilter !== 'ALL') {
      list = list.filter(inv => inv.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allInvoices, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTabSwitch = (tab: InvoiceTab) => {
    setActiveTab(tab);
    setStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getBadgeColor = (key: StatusFilter): string => {
    if (key === 'ALL') return '#9CD7FD';
    return statusBadgeColors[key] || '#CDCDCD';
  };

  const isDueOverdue = (inv: Invoice): boolean => {
    return inv.dueDateLabel.includes('ago');
  };

  const getActionButton = (inv: Invoice) => {
    if (activeTab === 'payables') {
      if (inv.status === 'APPROVED') return { label: 'Record Payment', show: true };
      if (inv.status === 'REVIEW_PENDING') return { label: 'Review Invoice', show: true };
      if (inv.status === 'PAID') return { label: 'Record Payment', show: true };
    } else {
      if (inv.status === 'PAID' || inv.status === 'RECEIVED') return { label: 'Settle', show: true };
      if (inv.status === 'DISPUTE_RAISED') return { label: 'Resolve', show: true };
    }
    return { label: '', show: false };
  };

  return (
    <div className="inv-root">
      {/* Navbar */}
      <div className="inv-navbar">
        <div className="inv-navbar-left">
          <span className="navbar-hamburger" onClick={onOpenMenu}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="13" y="1" width="4" height="4" rx="0.5"/>
              <rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/><rect x="13" y="7" width="4" height="4" rx="0.5"/>
              <rect x="1" y="13" width="4" height="4" rx="0.5"/><rect x="7" y="13" width="4" height="4" rx="0.5"/><rect x="13" y="13" width="4" height="4" rx="0.5"/>
            </svg>
          </span>
          {/* Payables / Receivables top tabs */}
          <button
            className={`inv-top-tab ${activeTab === 'payables' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('payables')}
          >Payables</button>
          <button
            className={`inv-top-tab ${activeTab === 'receivables' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('receivables')}
          >Receivables</button>
          <button
            className={`inv-top-tab ${activeTab === 'invoicing' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('invoicing')}
          >Invoicing</button>
        </div>
        <div className="navbar-right">
          <span style={{ position: 'relative', cursor: 'pointer', marginRight: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute', top: -6, right: -8,
              background: '#f5222d', color: '#fff', fontSize: 9, fontWeight: 700,
              borderRadius: 8, padding: '1px 4px', lineHeight: '12px',
            }}>3</span>
          </span>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', background: '#7B61FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>P</span>
        </div>
      </div>

      {/* Invoicing Tab - separate layout */}
      {activeTab === 'invoicing' && <InvoicingTab />}

      {/* Payables / Receivables content */}
      {activeTab !== 'invoicing' && (
        <>
          {/* Status Tabs + Action Buttons */}
          <div className="inv-status-bar">
            <div className="inv-status-tabs">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`inv-status-tab ${statusFilter === tab.key ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                >
                  {tab.label}
                  <span
                    className="inv-status-badge"
                    style={{ backgroundColor: getBadgeColor(tab.key) }}
                  >
                    {tab.key === 'ALL' ? counts.ALL : (counts[tab.key] || 0)}
                  </span>
                </button>
              ))}
            </div>
            <div className="inv-status-actions">
              <button className="inv-btn-outline" title="Activity Timeline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1890FF" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
              <button className="inv-btn-outline">Reports</button>
              {activeTab === 'receivables' && (
                <button className="inv-btn-primary">+ New Invoice</button>
              )}
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="inv-filter-toolbar">
            <div className="inv-filter-left">
              <div className="inv-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ marginRight: 6, flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="inv-search-input"
                />
              </div>
              <span className="inv-filter-date-label">Invoice Date</span>
              <div className="inv-date-btn-group">
                {dateFilters.map((df, i) => (
                  <button
                    key={df}
                    className={`inv-date-btn ${activeDateFilter === df ? 'active' : ''} ${i === 0 ? 'first' : ''} ${i === dateFilters.length - 1 ? 'last' : ''}`}
                    onClick={() => setActiveDateFilter(activeDateFilter === df ? '' : df)}
                  >{df}</button>
                ))}
              </div>
              <button className="inv-filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filters
              </button>
              <button className="inv-filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="9" y2="18"/>
                </svg>
                Sort By
              </button>
            </div>
            <div className="inv-filter-right">
              <button className="inv-icon-btn" title="Reload">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </button>
              <button className="inv-icon-btn" title="Download">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <div className="inv-pagination">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>&lt;</button>
                <span>{currentPage}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>&gt;</button>
              </div>
              <select
                className="inv-page-size"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}/page</option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoice Cards List */}
          <div className="inv-cards-list">
            {paginatedInvoices.length === 0 ? (
              <div className="inv-empty-state">
                <div style={{ fontSize: 48, marginBottom: 16, color: '#D9D9D9' }}>📄</div>
                <div style={{ fontSize: 21, fontWeight: 600, color: '#666' }}>No Invoices Found</div>
                <div style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
                  {activeTab === 'receivables' && (
                    <span style={{ color: '#1890FF', cursor: 'pointer' }}>Add Invoice!</span>
                  )}
                </div>
              </div>
            ) : (
              paginatedInvoices.map(inv => (
                <InvoiceCard key={inv.id} invoice={inv} activeTab={activeTab} />
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
};

// ---- Invoice Card Sub-component ----
const InvoiceCard: React.FC<{ invoice: Invoice; activeTab: InvoiceTab }> = ({ invoice: inv, activeTab }) => {
  const styles = statusCardStyles[inv.status] || statusCardStyles.APPROVED;
  const isOverdue = inv.dueDateLabel.includes('ago');

  const getActionButton = () => {
    if (activeTab === 'payables') {
      if (inv.status === 'APPROVED') return 'Record Payment';
      if (inv.status === 'REVIEW_PENDING') return 'Review Invoice';
      if (inv.status === 'PAID') return 'Record Payment';
    } else {
      if (inv.status === 'SETTLED') return null;
      if (inv.status === 'RECEIVED') return 'Settle';
      if (inv.status === 'DISPUTE_RAISED') return 'Resolve';
    }
    return 'Record Payment';
  };

  const actionLabel = getActionButton();

  return (
    <div
      className="inv-card"
      style={{ background: styles.bg, border: styles.border }}
    >
      {/* Col 1: Reference */}
      <div className="inv-card-col inv-card-ref" style={{ borderRight: styles.colBorder }}>
        <div className="inv-card-inv-num">{inv.invoiceNumber}</div>
        {inv.internalRef && (
          <div className="inv-card-meta">
            <span className="inv-card-meta-label">Internal #</span>{' '}
            <span className="inv-card-meta-value">{inv.internalRef}</span>
          </div>
        )}
        {inv.billNumber && (
          <div className="inv-card-meta">
            <span className="inv-card-meta-label">BL #</span>{' '}
            <span className="inv-card-meta-value">{inv.billNumber}</span>
          </div>
        )}
        {inv.hslNumber && (
          <div className="inv-card-meta">
            <span className="inv-card-meta-label">HSL #</span>{' '}
            <span className="inv-card-meta-value">{inv.hslNumber}</span>
          </div>
        )}
        {inv.awbNumber && (
          <div className="inv-card-meta">
            <span className="inv-card-meta-label">AWB #</span>{' '}
            <span className="inv-card-meta-value">{inv.awbNumber}</span>
          </div>
        )}
        {inv.shipmentNumber && (
          <div className="inv-card-shipment-link">{inv.shipmentNumber}</div>
        )}
      </div>

      {/* Col 2: Customer */}
      <div className="inv-card-col inv-card-customer" style={{ borderRight: styles.colBorder }}>
        <div className="inv-card-customer-name">{inv.customerName}</div>
        <div className="inv-card-inv-type">{inv.invoiceType}</div>
        <div className="inv-card-date">{inv.invoiceDate}</div>
        {inv.hasRemark && (
          <div className="inv-card-remark-link">View Remark</div>
        )}
      </div>

      {/* Col 3: Price */}
      <div className="inv-card-col inv-card-price" style={{ borderRight: styles.colBorder }}>
        <div className="inv-card-price-row">
          <span className="inv-card-price-label">Price</span>
          <span className="inv-card-price-currency">{inv.currency}</span>
          <span className="inv-card-price-value">{inv.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="inv-card-price-excl">Excluding Taxes</span>
        </div>
        <div className="inv-card-price-row" style={{ marginBottom: 16 }}>
          <span className="inv-card-price-label">Taxes</span>
          <span className="inv-card-price-currency">{inv.currency}</span>
          <span className="inv-card-price-value">{inv.taxes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
        </div>
        {inv.hasViewBreakdown && (
          <div className="inv-card-breakdown-link">View Breakdown</div>
        )}
      </div>

      {/* Col 4: Payment Status */}
      <div className="inv-card-col inv-card-payment" style={{ borderRight: styles.colBorder }}>
        <div className="inv-card-status-row">
          <span
            className="inv-card-status-badge"
            style={{ backgroundColor: statusBadgeColors[inv.status] }}
          >
            {statusDisplayNames[inv.status]}
          </span>
          {inv.dueDateLabel && (
            <span className={`inv-card-due ${isOverdue ? 'overdue' : ''}`}>
              {inv.dueDateLabel}
            </span>
          )}
        </div>
        <div className="inv-card-paid-balance">
          <div className="inv-card-amount-group">
            <span className={`inv-card-amount-currency ${inv.amountPaid > 0 ? 'active' : 'inactive'}`}>{inv.currency}</span>
            <span className={`inv-card-amount-value ${inv.amountPaid > 0 ? 'active' : 'inactive'}`}>
              {inv.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className={`inv-card-amount-label ${inv.amountPaid > 0 ? 'active' : 'inactive'}`}>Paid</span>
          </div>
          <div className="inv-card-amount-group">
            <span className={`inv-card-amount-currency ${inv.balance > 0 ? 'active' : 'inactive'}`}>{inv.currency}</span>
            <span className={`inv-card-amount-value ${inv.balance > 0 ? 'active' : 'inactive'}`}>
              {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`inv-card-amount-label ${inv.balance > 0 ? 'active' : 'inactive'}`}>Balance</span>
          </div>
        </div>
      </div>

      {/* Col 5: Docs & Actions */}
      <div className="inv-card-col inv-card-docs">
        <div className="inv-card-docs-links">
          {inv.hasInvoiceFile && (
            <div className="inv-card-doc-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1875F0" strokeWidth="2" style={{ marginRight: 4 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Invoice
            </div>
          )}
          {inv.hasPaymentProof && (
            <div className="inv-card-doc-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1875F0" strokeWidth="2" style={{ marginRight: 4 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Payment Proof
            </div>
          )}
        </div>
        <div className="inv-card-action-area">
          {actionLabel && (
            <button className="inv-card-action-btn">{actionLabel}</button>
          )}
          {/* Chat icon */}
          <button className="inv-card-chat-btn" title="Chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1890FF" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceScreen;
