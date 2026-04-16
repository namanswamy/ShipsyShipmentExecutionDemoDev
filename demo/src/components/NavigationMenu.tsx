import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  currentScreen: 'shipper' | 'approver' | 'invoice';
  onNavigate: (screen: 'shipper' | 'approver' | 'invoice', invoiceTab?: 'payables' | 'receivables' | 'invoicing') => void;
}

const modules = [
  { name: 'Track Shipments', desc: 'A Real-time visibility tool. Track containers (BL, Booking, Container No.) and air shipments (AWB), view their location, milestones and delays' },
  { name: 'Rate Inquiry', desc: 'Short-term request for rates. Use this module when you need freight rates for a single shipment or lane and run competitive bidding with vendors.' },
  { name: 'Quote', desc: 'Respond to shipper inquiries with quotes and manage bookings to secure deals' },
  { name: 'Contract Rates', desc: 'Live search & booking tool. Search confirmed rates, filter by route, carrier, validity, get trends & raise a booking request directly' },
  { name: 'Vessel Schedules', desc: 'Check the global sailing schedules to plan your shipments' },
  { name: 'Manage Tasks', desc: 'A workflow execution and compliance tool. Manage shipment tasks such as document uploads, approvals, and operational milestones' },
  { name: 'RFQ', desc: 'Launch long-term or multi-line RFQs. Use for bulk or quarterly/annual rate procurement, not single shipment requests' },
  { name: 'Shipsy BI(Insights)', desc: 'A business intelligence and analytics module. Use this to create and view dashboards, KPIs, and reports across inquiries, bookings, RFQs, shipments, and invoices' },
  { name: 'Invoice', desc: 'Manage Payables & Receivables: create, compare, approve, dispute, track all your invoices' },
  { name: 'Rate Master', desc: 'A storage library for all rates. Use this module to upload and store offline rate sheets or view confirmed bids that are auto-captured into your system', star: true },
];

const rightLinks1 = ['Team Management', 'My Charge Master', 'Demurrage & Detention', 'My Suppliers', 'My Shipping Lines', 'API Documentation', 'Bulk Request'];
const rightLinks2 = ['Terms & Conditions', 'Regions Template', 'My Customers', 'My Vendors', 'My Products', 'Custom Configurations', 'Tasks Workflow'];

const topTabs = ['Home', 'Contract Rates', 'Vessel Schedules', 'RFQ Plans'];

const NavigationMenu: React.FC<Props> = ({ onClose, currentScreen, onNavigate }) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.3)', zIndex: 200,
      fontFamily: "'Open Sans', system-ui, sans-serif",
    }}>
    <div style={{
      width: '100%', height: '55vh', background: '#fff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px', borderBottom: '1px solid #F7F7F7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#333',
          }}>&#10005;</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>Manage Tasks</span>
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

      {/* Top tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 18px', borderBottom: '1px solid #eee',
      }}>
        {topTabs.map(tab => (
          <button key={tab} style={{
            padding: '10px 16px', fontSize: 13, fontFamily: 'inherit',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === 'Home' ? '2px solid #006EC3' : '2px solid transparent',
            color: tab === 'Home' ? '#006EC3' : '#666',
            fontWeight: tab === 'Home' ? 700 : 400,
          }}>{tab}</button>
        ))}
        {/* Shipsy logo right-aligned */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 8 }}>
          <img src="/shipsy-logo.jpg" alt="Shipsy" style={{ height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 18, color: '#006EC3', marginLeft: 4 }}>Shipsy</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'auto' }}>
        {/* Left — Module cards */}
        <div style={{
          flex: 1, padding: '24px 28px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 32px',
          alignContent: 'start',
        }}>
          {modules.map(m => (
            <div
              key={m.name}
              style={{ position: 'relative', paddingBottom: (m.name === 'Manage Tasks' || m.name === 'Invoice') ? 8 : 0 }}
              onMouseEnter={() => setHoveredModule(m.name)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              <div
                style={{
                  fontSize: 14, fontWeight: 700,
                  color: (m.name === 'Invoice' && currentScreen === 'invoice') ? '#006EC3' : '#111',
                  cursor: 'pointer',
                  marginBottom: 4,
                }}
              >
                {m.name}
                {m.star && <span style={{ color: '#FFB300', marginLeft: 4 }}>&#9733;</span>}
              </div>
              <div style={{ fontSize: 11, color: '#666', lineHeight: '16px' }}>{m.desc}</div>

              {/* Manage Tasks hover submenu */}
              {m.name === 'Manage Tasks' && hoveredModule === 'Manage Tasks' && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 0,
                  background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 10,
                  minWidth: 160, overflow: 'hidden',
                }}>
                  {['Shipper', 'Vendor', 'Approver'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => {
                        if (opt === 'Shipper') onNavigate('shipper');
                        else if (opt === 'Approver') onNavigate('approver');
                        onClose();
                      }}
                      style={{
                        padding: '10px 16px', fontSize: 12, cursor: 'pointer',
                        color: (opt === 'Shipper' && currentScreen === 'shipper') || (opt === 'Approver' && currentScreen === 'approver') ? '#006EC3' : '#333',
                        fontWeight: (opt === 'Shipper' && currentScreen === 'shipper') || (opt === 'Approver' && currentScreen === 'approver') ? 700 : 400,
                        background: '#fff',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {/* Invoice hover submenu */}
              {m.name === 'Invoice' && hoveredModule === 'Invoice' && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 0,
                  background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 10,
                  minWidth: 160, overflow: 'hidden',
                }}>
                  {(['Payables', 'Receivables', 'Invoicing'] as const).map(opt => (
                    <div
                      key={opt}
                      onClick={() => {
                        const tabMap = { Payables: 'payables', Receivables: 'receivables', Invoicing: 'invoicing' } as const;
                        onNavigate('invoice', tabMap[opt]);
                        onClose();
                      }}
                      style={{
                        padding: '10px 16px', fontSize: 12, cursor: 'pointer',
                        color: '#333',
                        fontWeight: 400,
                        background: '#fff',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right — Settings links */}
        <div style={{
          width: 340, borderLeft: '1px solid #eee', padding: '24px 20px',
          display: 'flex', gap: 40,
        }}>
          <div style={{ flex: 1 }}>
            {rightLinks1.map(link => (
              <div key={link} style={{
                fontSize: 12, color: '#333', padding: '8px 0', cursor: 'pointer',
              }}>{link}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {rightLinks2.map(link => (
              <div key={link} style={{
                fontSize: 12, color: '#333', padding: '8px 0', cursor: 'pointer',
              }}>{link}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default NavigationMenu;
