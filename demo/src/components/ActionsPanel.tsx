import React, { useState, useMemo, useEffect } from 'react';
import { personas } from '../data/tasks';
import type { ShipmentMode } from '../data/taskSequence';
import { resolveTasksForShipment } from '../data/taskSequence';
import TasksListSequenced from './TasksListSequenced';
import type { GPOResult } from './GPOTaskView';
import type { IncidentalDraft } from './IncidentalChargesView';

interface Props {
  selectedShipmentId: string | null;
  incoterm: string;
  shipmentMode: string;
}

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

const ActionsPanel: React.FC<Props> = ({ selectedShipmentId, incoterm, shipmentMode }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [activePersona, setActivePersona] = useState('Shipper');
  const [showActivity, setShowActivity] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<'CFS' | 'ICD' | null>(null);
  const [visiblePersonaIds, setVisiblePersonaIds] = useState<string[]>(['Shipper']);

  // Fix 4: Task-related state lifted from TasksListSequenced to persist across tab switches
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [savedFields, setSavedFields] = useState<Record<string, Record<string, string>>>({});
  const [vendorSelections, setVendorSelections] = useState<string[]>([]);
  const [gpoResult, setGpoResult] = useState<GPOResult | null>(null);
  const [portDetails, setPortDetails] = useState<{ pol: string; pod: string }>({ pol: '', pod: '' });
  const [isSpot, setIsSpot] = useState(false);
  const [incidentalDrafts, setIncidentalDrafts] = useState<Record<string, IncidentalDraft>>({});
  const [openTaskKey, setOpenTaskKey] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [multiVendorSubmitted, setMultiVendorSubmitted] = useState<Record<string, Set<number>>>({});

  const mode = (shipmentMode === 'BB' || shipmentMode === 'BULK') ? shipmentMode as ShipmentMode
    : shipmentMode === 'Break Bulk' ? 'BB' as ShipmentMode
    : shipmentMode as ShipmentMode;

  const allResolvedTasks = useMemo(
    () => resolveTasksForShipment(mode, incoterm, selectedVendor),
    [mode, incoterm, selectedVendor]
  );

  // Pre-populated statuses for DEMO-READY shipment
  const getDemoReadyStatuses = (): Record<string, string> => {
    const doneStatuses: Record<string, string> = {};
    allResolvedTasks.forEach(t => {
      if (t.seq <= 25) doneStatuses[t.taskKey] = 'Done';
    });
    return doneStatuses;
  };

  // Reset everything when shipment changes
  useEffect(() => {
    setActivePersona('Shipper');
    setActiveTab('tasks');
    setShowActivity(false);
    setShowChat(false);
    setSelectedVendor(null);
    setVisiblePersonaIds(['Shipper']);
    setOpenTaskKey(null);
    setCollapsed({});
    setSavedFields({});
    setIncidentalDrafts({});
    setMultiVendorSubmitted({});

    if (selectedShipmentId === 'DEMO-READY') {
      setStatuses(getDemoReadyStatuses());
      setVendorSelections(['Freight Forwarder', 'CHA', 'Transporter']);
      setGpoResult(null);
      setPortDetails({ pol: 'SHANGHAI', pod: 'NHAVA SHEVA' });
      setIsSpot(false);
    } else {
      setStatuses({});
      setVendorSelections([]);
      setGpoResult(null);
      setPortDetails({ pol: '', pod: '' });
      setIsSpot(false);
    }
  }, [selectedShipmentId]);

  // Reset to Shipper if current persona becomes hidden
  useEffect(() => {
    if (!visiblePersonaIds.includes(activePersona)) {
      setActivePersona('Shipper');
    }
  }, [visiblePersonaIds, activePersona]);

  // Filter personas list to only those with visible tasks
  const displayPersonas = useMemo(
    () => personas.filter(p => visiblePersonaIds.includes(p.id)),
    [visiblePersonaIds]
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
          <button className="action-icon-btn" title="Activity"
            onClick={() => { setShowActivity(!showActivity); setShowChat(false); }}>
            <ListIcon />
          </button>
          <button className="action-icon-btn" title="Chat"
            onClick={() => { setShowChat(!showChat); setShowActivity(false); }}>
            <ChatIcon />
          </button>
          <button className="action-icon-btn" title="More"><MoreIcon /></button>
        </div>
      </div>

      {/* Persona switcher — only shows personas with unlocked tasks */}
      {activeTab === 'tasks' && (
        <div className="persona-bar">
          <span className="persona-label">Persona:</span>
          {displayPersonas.map(p => (
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
      {activeTab === 'tasks' && (
        <TasksListSequenced
          allTasks={allResolvedTasks}
          activePersona={activePersona}
          incoterm={incoterm}
          shipmentMode={mode}
          onVendorSelected={setSelectedVendor}
          onVisiblePersonasChange={setVisiblePersonaIds}
          statuses={statuses}
          setStatuses={setStatuses}
          savedFields={savedFields}
          setSavedFields={setSavedFields}
          vendorSelections={vendorSelections}
          setVendorSelections={setVendorSelections}
          gpoResult={gpoResult}
          setGpoResult={setGpoResult}
          portDetails={portDetails}
          setPortDetails={setPortDetails}
          isSpot={isSpot}
          setIsSpot={setIsSpot}
          incidentalDrafts={incidentalDrafts}
          setIncidentalDrafts={setIncidentalDrafts}
          openTaskKey={openTaskKey}
          setOpenTaskKey={setOpenTaskKey}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          multiVendorSubmitted={multiVendorSubmitted}
          setMultiVendorSubmitted={setMultiVendorSubmitted}
        />
      )}
    </div>
  );
};

export default ActionsPanel;
