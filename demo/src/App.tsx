import { useState } from 'react';
import './App.css';
import { shipments } from './data/tasks';
import Filters from './components/Filters';
import MilestoneBar from './components/MilestoneBar';
import ShipmentCard from './components/ShipmentCard';
import ActionsPanel from './components/ActionsPanel';
import NavigationMenu from './components/NavigationMenu';
import ApproverScreen from './components/ApproverScreen';

function App() {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(shipments[0].id);
  const selectedShipment = shipments.find(s => s.id === selectedShipmentId);
  const [activeMilestone, setActiveMilestone] = useState('ALL');
  const [showMenu, setShowMenu] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'shipper' | 'approver'>('shipper');
  // Track spot/normal overrides per shipment (set dynamically when user selects in task 1)
  const [spotNormalMap, setSpotNormalMap] = useState<Record<string, 'Spot' | 'Normal'>>({});

  const handleSpotNormalChange = (value: 'Spot' | 'Normal') => {
    setSpotNormalMap(prev => ({ ...prev, [selectedShipmentId]: value }));
  };

  const handleNavigate = (screen: 'shipper' | 'approver') => {
    setCurrentScreen(screen);
    setShowMenu(false);
  };

  // Navigation menu (shared across screens)
  const menuOverlay = showMenu && (
    <NavigationMenu
      onClose={() => setShowMenu(false)}
      currentScreen={currentScreen}
      onNavigate={handleNavigate}
    />
  );

  // Approver Screen
  if (currentScreen === 'approver') {
    return (
      <>
        <ApproverScreen onOpenMenu={() => setShowMenu(true)} />
        {menuOverlay}
      </>
    );
  }

  // Shipper (Manage Tasks) Screen
  return (
    <div className="app-root">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-left">
          <span className="navbar-hamburger" onClick={() => setShowMenu(true)}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="13" y="1" width="4" height="4" rx="0.5"/>
              <rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/><rect x="13" y="7" width="4" height="4" rx="0.5"/>
              <rect x="1" y="13" width="4" height="4" rx="0.5"/><rect x="7" y="13" width="4" height="4" rx="0.5"/><rect x="13" y="13" width="4" height="4" rx="0.5"/>
            </svg>
          </span>
          <span className="navbar-title">Manage Tasks</span>
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
            }}>99+</span>
          </span>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', background: '#7B61FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>P</span>
        </div>
      </div>

      {/* Filter bar */}
      <Filters />

      {/* Milestone tabs + pagination */}
      <MilestoneBar active={activeMilestone} onChange={setActiveMilestone} />

      {/* Body: shipment list + actions panel */}
      <div className="body-content">
        <div className="shipment-list-panel">
          {shipments.map(s => (
            <ShipmentCard
              key={s.id}
              data={s}
              selected={selectedShipmentId === s.id}
              onClick={() => setSelectedShipmentId(s.id)}
              spotNormalOverride={spotNormalMap[s.id] || null}
            />
          ))}
        </div>
        <div className="shipment-actions-panel">
          <ActionsPanel selectedShipmentId={selectedShipmentId} incoterm={selectedShipment?.incoterm || ''} shipmentMode={selectedShipment?.mode || 'FCL'} onSpotNormalChange={handleSpotNormalChange} />
        </div>
      </div>

      {menuOverlay}
    </div>
  );
}

export default App;
