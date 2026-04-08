import React, { useState, useMemo, useEffect } from 'react';
import { personas, shipments } from '../data/tasks';
import type { ShipmentMode } from '../data/taskSequence';
import { resolveTasksForShipment } from '../data/taskSequence';
import TasksListSequenced from './TasksListSequenced';
import type { GPOResult } from './GPOTaskView';
import type { IncidentalDraft } from './IncidentalChargesView';
import { createDemo3Draft, createDemo4Draft } from '../data/incidentalCharges';

interface Props {
  selectedShipmentId: string | null;
  incoterm: string;
  shipmentMode: string;
  onSpotNormalChange?: (value: 'Spot' | 'Tender') => void;
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

const ActionsPanel: React.FC<Props> = ({ selectedShipmentId, incoterm, shipmentMode, onSpotNormalChange }) => {
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
  const [confirmedVendors, setConfirmedVendors] = useState<Record<string, string[]>>({});

  const mode = (shipmentMode === 'BB' || shipmentMode === 'BULK') ? shipmentMode as ShipmentMode
    : shipmentMode === 'Break Bulk' ? 'BB' as ShipmentMode
    : shipmentMode as ShipmentMode;

  const allResolvedTasks = useMemo(
    () => resolveTasksForShipment(mode, incoterm, selectedVendor),
    [mode, incoterm, selectedVendor]
  );

  // Reset everything when shipment changes
  useEffect(() => {
    setActivePersona('Shipper');
    setActiveTab('tasks');
    setShowActivity(false);
    setShowChat(false);
    setSelectedVendor(null);
    // Don't reset visiblePersonaIds here — let TasksListSequenced recalculate it
    // from the new statuses to avoid race conditions
    setOpenTaskKey(null);
    setCollapsed({});
    setSavedFields({});
    setIncidentalDrafts({});
    setMultiVendorSubmitted({});
    setConfirmedVendors({});

    const isDemoIncidental = ['ASN-0021','ASN-0022','ASN-0023','ASN-0024'].includes(selectedShipmentId || '');
    if (isDemoIncidental) {
      // Resolve tasks fresh (not from stale memo) to avoid race conditions
      const freshTasks = resolveTasksForShipment(mode, incoterm, null);
      const demoStatuses: Record<string, string> = {};
      freshTasks.forEach(t => {
        if (t.seq <= 25) demoStatuses[t.taskKey] = 'Done';
      });

      setVendorSelections(['Freight Forwarder', 'CHA', 'Transporter']);
      setGpoResult(null);
      setPortDetails({ pol: 'SHANGHAI', pod: 'NHAVA SHEVA' });
      setIsSpot(false);
      setConfirmedVendors({ 'Transporter': ['Transporter 1', 'Transporter 2'] });

      // Find the FF Incidental Events task key to set demo-specific states
      const ffIncidentalTask = freshTasks.find(t => t.name === 'FF Incidental Events');
      const taskKey = ffIncidentalTask?.taskKey || '';

      if (selectedShipmentId === 'ASN-0022' && taskKey) {
        // FF: incidental approved, charge confirmation done
        demoStatuses[taskKey] = 'Approved';
        const ffMerged = freshTasks.find(t => t.name === 'FF Charge Confirmation & Invoicing');
        if (ffMerged) demoStatuses[ffMerged.taskKey] = 'Done';
        // CHA Incidental Events: open — user selects charges, Self & Third-Party auto-prefill
        setStatuses(demoStatuses);
        setIncidentalDrafts({
          [taskKey]: createDemo4Draft() as IncidentalDraft,
        });
      } else if (selectedShipmentId === 'ASN-0023' && taskKey) {
        setStatuses({ ...demoStatuses, [taskKey]: 'Rejected' });
        setIncidentalDrafts({ [taskKey]: createDemo3Draft() as IncidentalDraft });
      } else if (selectedShipmentId === 'ASN-0024' && taskKey) {
        setStatuses({ ...demoStatuses, [taskKey]: 'Approved' });
        setIncidentalDrafts({ [taskKey]: createDemo4Draft() as IncidentalDraft });
      } else {
        setStatuses(demoStatuses);
      }
    } else if (selectedShipmentId === 'ASN-0025' || selectedShipmentId === 'ASN-0026') {
      // Charge Confirmation demo shipments — incidentals approved, charge confirmation task open
      const freshTasks = resolveTasksForShipment(mode, incoterm, null);
      const demoStatuses: Record<string, string> = {};
      freshTasks.forEach(t => {
        if (t.seq <= 25) demoStatuses[t.taskKey] = 'Done';
      });

      setVendorSelections(['Freight Forwarder', 'CHA', 'Transporter']);
      setGpoResult(null);
      setIsSpot(false);
      setConfirmedVendors({ 'Transporter': ['Transporter 1', 'Transporter 2'] });

      if (selectedShipmentId === 'ASN-0025') {
        setPortDetails({ pol: 'SHANGHAI', pod: 'NHAVA SHEVA' });
        // FF incidental approved → FF Charge Confirmation & Invoicing is next
        const ffIncidental = freshTasks.find(t => t.name === 'FF Incidental Events');
        if (ffIncidental) demoStatuses[ffIncidental.taskKey] = 'Approved';
        setIncidentalDrafts(ffIncidental ? { [ffIncidental.taskKey]: createDemo4Draft() as IncidentalDraft } : {});
      } else {
        setPortDetails({ pol: 'BUSAN', pod: 'MUNDRA' });
        // FF done through merged task, CHA incidental approved → CHA Charge Confirmation & Invoice is next
        const ffIncidental = freshTasks.find(t => t.name === 'FF Incidental Events');
        const ffMerged = freshTasks.find(t => t.name === 'FF Charge Confirmation & Invoicing');
        const chaIncidental = freshTasks.find(t => t.name === 'CHA Incidental Events');
        if (ffIncidental) demoStatuses[ffIncidental.taskKey] = 'Approved';
        if (ffMerged) demoStatuses[ffMerged.taskKey] = 'Done';
        if (chaIncidental) demoStatuses[chaIncidental.taskKey] = 'Approved';
      }
      setStatuses(demoStatuses);
    } else {
      // Check if shipment has pre-configured spot/tender
      const shipmentData = shipments.find(s => s.id === selectedShipmentId);
      if (shipmentData?.spotNormal) {
        const isSpotVal = shipmentData.spotNormal === 'Spot';
        setIsSpot(isSpotVal);
        // Task 1 is already done for these shipments
        const firstTask = allResolvedTasks.find(t => t.seq === 1);
        if (firstTask) {
          setStatuses({ [firstTask.taskKey]: 'Done' });
        }
      } else {
        setStatuses({});
        setIsSpot(false);
      }
      setVendorSelections([]);
      setGpoResult(null);
      setPortDetails({ pol: '', pod: '' });
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
          confirmedVendors={confirmedVendors}
          setConfirmedVendors={setConfirmedVendors}
          onSpotNormalChange={onSpotNormalChange}
        />
      )}
    </div>
  );
};

export default ActionsPanel;
