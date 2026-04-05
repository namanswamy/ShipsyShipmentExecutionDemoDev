import React, { useState, useMemo, useEffect } from 'react';
import { tasks as allTasks, personas } from '../data/tasks';
import TasksList from './TasksList';

interface Props {
  selectedShipmentId: string | null;
  incoterm: string;
}

const C_INCOTERMS = ['CIF', 'CFR', 'CPT', 'CIP'];
const D_INCOTERMS = ['DAP', 'DPU', 'DDP'];

const getVisiblePersonas = (incoterm: string) => {
  if (C_INCOTERMS.includes(incoterm)) {
    // Hide FF, keep Shipper, CHA, CFS, ICD, Transporter
    return personas.filter(p => p.id !== 'FF');
  }
  if (D_INCOTERMS.includes(incoterm)) {
    // Only Shipper and Transporter
    return personas.filter(p => p.id === 'Shipper' || p.id === 'Transporter');
  }
  // All personas
  return personas;
};

const actionTabs = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'documents', label: 'Documents' },
  { key: 'details', label: 'Details' },
  { key: 'tracking', label: 'Tracking' },
];

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
);

const ActionsPanel: React.FC<Props> = ({ selectedShipmentId, incoterm }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [activePersona, setActivePersona] = useState('Shipper');
  const [showActivity, setShowActivity] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const visiblePersonas = useMemo(() => getVisiblePersonas(incoterm), [incoterm]);

  // Reset everything when shipment changes
  useEffect(() => {
    setActivePersona('Shipper');
    setActiveTab('tasks');
    setShowActivity(false);
    setShowChat(false);
  }, [selectedShipmentId]);

  // Reset to Shipper if current persona is hidden due to incoterm change
  useEffect(() => {
    if (!visiblePersonas.find(p => p.id === activePersona)) {
      setActivePersona('Shipper');
    }
  }, [visiblePersonas, activePersona]);

  const personaTasks = useMemo(
    () => allTasks.filter(t => t.org === activePersona),
    [activePersona]
  );

  if (!selectedShipmentId) {
    return (
      <div className="actions-panel" style={{ padding: 48, textAlign: 'center', color: '#999' }}>
        Select a shipment to view tasks
      </div>
    );
  }

  return (
    <div className="actions-panel" style={{ position: 'relative' }}>
      {/* Tabs bar */}
      <div className="action-tabs-bar">
        <div className="action-tabs-left">
          {actionTabs.map(t => (
            <button
              key={t.key}
              className={`action-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="action-tabs-right">
          <button
            className="action-icon-btn"
            title="Activity"
            onClick={() => { setShowActivity(!showActivity); setShowChat(false); }}
          >
            <ListIcon />
          </button>
          <button
            className="action-icon-btn"
            title="Chat"
            onClick={() => { setShowChat(!showChat); setShowActivity(false); }}
          >
            <ChatIcon />
          </button>
          <button className="action-icon-btn" title="More">
            <MoreIcon />
          </button>
        </div>
      </div>

      {/* Persona switcher - filtered by incoterm */}
      {activeTab === 'tasks' && (
        <div className="persona-bar">
          <span className="persona-label">Persona:</span>
          {visiblePersonas.map(p => (
            <button
              key={p.id}
              className={`persona-tab ${activePersona === p.id ? 'active' : ''}`}
              onClick={() => setActivePersona(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Activity overlay */}
      {showActivity && (
        <div className="overlay-panel">
          <div className="overlay-header">
            <span>Activity</span>
            <button className="overlay-close" onClick={() => setShowActivity(false)}>&#10005;</button>
          </div>
          <div className="overlay-body">
            <p>Activity log for shipment {selectedShipmentId}</p>
            <p style={{ fontSize: 11, marginTop: 8 }}>Task status changes, field updates, and comments will appear here.</p>
          </div>
        </div>
      )}

      {/* Chat overlay */}
      {showChat && (
        <div className="overlay-panel">
          <div className="overlay-header">
            <span>Chat</span>
            <button className="overlay-close" onClick={() => setShowChat(false)}>&#10005;</button>
          </div>
          <div className="overlay-body">
            <p>Collaboration chat for shipment {selectedShipmentId}</p>
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab !== 'tasks' && (
        <div className="tab-placeholder">
          Switch to <b>Tasks</b> tab to manage shipment tasks.
        </div>
      )}
      {activeTab === 'tasks' && <TasksList tasks={personaTasks} incoterm={incoterm} shipmentId={selectedShipmentId} />}
    </div>
  );
};

export default ActionsPanel;
