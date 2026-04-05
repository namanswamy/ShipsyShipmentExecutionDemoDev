import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ResolvedTask, ShipmentMode } from '../data/taskSequence';
import { TASK_FIELDS } from '../data/taskFields';
import TaskDetail from './TaskDetail';
import GPOTaskView from './GPOTaskView';
import type { GPOResult } from './GPOTaskView';
import IncidentalChargesView from './IncidentalChargesView';
import type { IncidentalDraft } from './IncidentalChargesView';

const milestones = ['Drafts', 'Origin', 'In Transit', 'Destination'];

const STATUS_OPTS = [
  { v: 'Not Started', bg: '#F4F4F4', c: '#555' },
  { v: 'In Progress', bg: '#FFFED2', c: '#8B7000' },
  { v: 'Done', bg: '#D3FFEA', c: '#0F6E3C' },
  { v: 'Cancelled', bg: '#FFD3D3', c: '#A00' },
];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006EC3" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);
const SuccessIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" fill="#43A047" stroke="#43A047"/>
    <polyline points="8 12 11 15 16 9" stroke="#fff"/>
  </svg>
);

interface Props {
  allTasks: ResolvedTask[];
  activePersona: string;
  incoterm: string;
  shipmentMode: ShipmentMode;
  shipmentId: string | null;
  onVendorSelected: (vendor: 'CFS' | 'ICD' | null) => void;
  onVisiblePersonasChange: (personas: string[]) => void;
}

const TasksListSequenced: React.FC<Props> = ({
  allTasks, activePersona, incoterm, shipmentMode, shipmentId, onVendorSelected, onVisiblePersonasChange,
}) => {
  const [openTaskKey, setOpenTaskKey] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [vendorSelections, setVendorSelections] = useState<string[]>([]);
  const [gpoResult, setGpoResult] = useState<GPOResult | null>(null);
  const [portDetails, setPortDetails] = useState<{ pol: string; pod: string }>({ pol: '', pod: '' });
  const [savedFields, setSavedFields] = useState<Record<string, Record<string, string>>>({});
  const [isSpot, setIsSpot] = useState(false);
  const [incidentalDrafts, setIncidentalDrafts] = useState<Record<string, IncidentalDraft>>({});

  // Reset on shipment change
  useEffect(() => {
    setOpenTaskKey(null);
    setStatuses({});
    setCollapsed({});
    setIsProcessing(false);
    setToastMessage(null);
    setVendorSelections([]);
    setGpoResult(null);
    setPortDetails({ pol: '', pod: '' });
    setSavedFields({});
    setIsSpot(false);
    setIncidentalDrafts({});
  }, [shipmentId]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const getStatus = (key: string) => statuses[key] || 'Not Started';

  const currentActiveSeq = useMemo(() => {
    for (const t of allTasks) {
      if (getStatus(t.taskKey) !== 'Done') return t.seq;
    }
    return Infinity;
  }, [allTasks, statuses]);

  const visibleTasks = useMemo(
    () => allTasks.filter(t => t.seq <= currentActiveSeq),
    [allTasks, currentActiveSeq]
  );

  // Report which personas have visible tasks
  useEffect(() => {
    const personaSet = new Set(visibleTasks.map(t => t.persona));
    personaSet.add('Shipper'); // Always show Shipper
    onVisiblePersonasChange(Array.from(personaSet));
  }, [visibleTasks, onVisiblePersonasChange]);

  const personaTasks = useMemo(
    () => visibleTasks.filter(t => {
      if (activePersona === 'Shipper') return t.persona === 'Shipper';
      return t.persona === activePersona;
    }),
    [visibleTasks, activePersona]
  );

  const grouped = useMemo(() => {
    const g: Record<string, ResolvedTask[]> = {};
    milestones.forEach(m => { g[m] = personaTasks.filter(t => t.milestone === m); });
    return g;
  }, [personaTasks]);

  // Simulate backend processing then complete
  const processTaskCompletion = useCallback((taskKey: string, closeDetail: boolean) => {
    setIsProcessing(true);
    const delay = 1000; // 1 second
    setTimeout(() => {
      setStatuses(prev => ({ ...prev, [taskKey]: 'Done' }));
      if (closeDetail) setOpenTaskKey(null);
      setIsProcessing(false);
      setToastMessage('Data submitted successfully');
    }, delay);
  }, []);

  // Handle status change from dropdown
  const handleStatusChange = (taskKey: string, status: string) => {
    if (status === 'Done') {
      processTaskCompletion(taskKey, false);
    } else {
      setStatuses({ ...statuses, [taskKey]: status });
    }
  };

  // Handle submit from task detail — save field values and extract POL/POD
  const handleSubmitTask = (taskKey: string, fieldValues?: Record<string, string>) => {
    if (fieldValues) {
      setSavedFields(prev => ({ ...prev, [taskKey]: fieldValues }));

      const task = allTasks.find(t => t.taskKey === taskKey);

      // Extract Spot/Normal from Select Mode of Shipment
      if (task?.name === 'Select Mode of Shipment') {
        setIsSpot(fieldValues['Spot / Normal'] === 'Spot');
      }

      // Extract POL/POD from Select Port Details
      if (task?.name === 'Select Port Details') {
        const pol = fieldValues['Port of Loading'] || '';
        const pod = fieldValues['Port of Discharge'] || '';
        // Extract port name from "CODE - Name" format
        const polName = pol.includes(' - ') ? pol.split(' - ')[1] : pol;
        const podName = pod.includes(' - ') ? pod.split(' - ')[1] : pod;
        setPortDetails({ pol: polName.toUpperCase(), pod: podName.toUpperCase() });
      }
    }
    processTaskCompletion(taskKey, true);
  };

  // Track vendor selections from Vendor Selection task submit
  const handleVendorTaskSubmit = (vendors: string[]) => {
    setVendorSelections(vendors);
    // Save vendor selections as field values for persistence
    const vendorFieldValues: Record<string, string> = { 'Vendor Selection': vendors.join(', ') };
    handleSubmitTask(openTaskKey!, vendorFieldValues);
  };

  // Handle GPO submit
  const handleGPOSubmit = (result: GPOResult) => {
    setGpoResult(result);
    // If no deviation, skip L1 Deviation task — mark both GPO and L1 as done
    if (result.totalDeviation === 0) {
      const l1Task = allTasks.find(t => t.name === 'Approval of L1 Deviation');
      if (l1Task) {
        // Mark L1 as Done too since no deviation
        setStatuses(prev => ({ ...prev, [l1Task.taskKey]: 'Done' }));
      }
    }
    handleSubmitTask(openTaskKey!);
  };

  // Handle L1 Approval submit
  const handleL1Submit = () => {
    handleSubmitTask(openTaskKey!);
  };

  // Incidental task names
  const INCIDENTAL_TASKS = [
    'FF Incidental Events', 'CHA Incidental Events',
    'CFS Incidental Events', 'ICD Incidental Events', 'Transporter Incidental Events',
  ];

  // Open task detail
  if (openTaskKey && !isProcessing) {
    const task = allTasks.find(t => t.taskKey === openTaskKey);
    if (task) {
      // Incidental Charges tasks
      if (INCIDENTAL_TASKS.includes(task.name)) {
        return (
          <IncidentalChargesView
            taskName={task.name}
            onClose={() => setOpenTaskKey(null)}
            onSendForApproval={() => {
              setStatuses(prev => ({ ...prev, [openTaskKey]: 'Sent for Approval' }));
              processTaskCompletion(openTaskKey, true);
            }}
            savedDraft={incidentalDrafts[openTaskKey] || null}
            onSaveDraft={(draft) => {
              setIncidentalDrafts(prev => ({ ...prev, [openTaskKey]: draft }));
              setOpenTaskKey(null);
            }}
          />
        );
      }

      // GPO Task — show bid cards
      if (task.name === 'Run Global Plan Optimizer') {
        return (
          <GPOTaskView
            selectedVendors={vendorSelections}
            pol={portDetails.pol}
            pod={portDetails.pod}
            isSpot={isSpot}
            onClose={() => setOpenTaskKey(null)}
            onSubmit={handleGPOSubmit}
          />
        );
      }

      // L1 Deviation Approval — show bid cards read-only
      if (task.name === 'Approval of L1 Deviation') {
        return (
          <GPOTaskView
            selectedVendors={vendorSelections}
            pol={portDetails.pol}
            pod={portDetails.pod}
            isSpot={isSpot}
            onClose={() => setOpenTaskKey(null)}
            onSubmit={handleL1Submit}
            readOnly={true}
            previousResult={gpoResult}
          />
        );
      }

      // Regular task detail
      const fieldDef = TASK_FIELDS[task.name];
      const taskObj = {
        id: task.seq,
        name: task.name,
        org: task.persona,
        code: task.taskKey,
        team: task.assignee,
        ms: task.milestone,
        assignee: task.assignee === 'Ops' ? 'Reliance' : task.assignee,
        approved: task.approved,
        isNew: task.isNew,
        fields: fieldDef?.fields || [],
        docFields: fieldDef?.docFields,
        docName: fieldDef?.docName,
      };
      return (
        <TaskDetail
          task={taskObj}
          incoterm={incoterm}
          shipmentMode={shipmentMode}
          onClose={() => setOpenTaskKey(null)}
          onVendorSelected={onVendorSelected}
          onSubmit={(fieldValues) => handleSubmitTask(openTaskKey, fieldValues)}
          onVendorTaskSubmit={task.name === 'Vendor Selection' ? handleVendorTaskSubmit : undefined}
          savedFieldValues={savedFields[openTaskKey]}
        />
      );
    }
  }

  const hasAnyTasks = personaTasks.length > 0;

  return (
    <div className="tasks-container" style={{ position: 'relative' }}>
      {/* Loading overlay */}
      {isProcessing && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.85)', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12,
        }}>
          <SpinnerIcon />
          <span style={{ fontSize: 13, color: '#333', fontWeight: 600 }}>Submitting task data...</span>
        </div>
      )}

      {/* Success toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#43A047', color: '#fff', padding: '10px 20px',
          borderRadius: 6, fontSize: 13, fontWeight: 600, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <SuccessIcon />
          {toastMessage}
        </div>
      )}

      {!hasAnyTasks ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>
          No tasks available yet for this persona. Complete preceding tasks to unlock.
        </div>
      ) : (
        milestones.map(ms => {
          const msTasks = grouped[ms] || [];
          if (msTasks.length === 0) return null;
          const total = msTasks.length;
          const done = msTasks.filter(t => getStatus(t.taskKey) === 'Done').length;
          const isOpen = !collapsed[ms];
          const allDone = done === total && total > 0;
          const successPct = total ? (done / total) * 100 : 0;

          return (
            <div key={ms} className="ms-section">
              <div
                className={`ms-collapse-header ${allDone ? 'done' : 'pending'}`}
                onClick={() => setCollapsed({ ...collapsed, [ms]: !collapsed[ms] })}
              >
                <div className="ms-collapse-left">
                  <span className="ms-collapse-arrow" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                    &#9662;
                  </span>
                  <span className="ms-collapse-name">{ms}</span>
                  <div className="ms-collapse-stats">
                    <span className="ms-tasks-done-label">Tasks Done:</span>
                    <span>
                      <span className="ms-done-count">{done}</span>
                      <span className="ms-total-count">/{total}</span>
                    </span>
                    <span className="ms-progress">
                      <span className="ms-progress-success" style={{ width: `${successPct}%` }} />
                    </span>
                  </div>
                </div>
                <button className="ms-add-task-btn" onClick={e => e.stopPropagation()}>+ Add Task</button>
              </div>

              {isOpen && (
                <div className="task-table">
                  <div className="task-table-head">
                    <div>S.N.</div>
                    <div>Task Name</div>
                    <div>Status</div>
                    <div>Assignee</div>
                    <div></div>
                  </div>
                  {msTasks.map((t, idx) => {
                    const st = getStatus(t.taskKey);
                    const stObj = STATUS_OPTS.find(s => s.v === st) || STATUS_OPTS[0];


                    return (
                      <div key={t.taskKey} className="task-row">
                        <div className="task-cell-sn">{idx + 1}</div>

                        <div
                          className="task-cell-name"
                          onClick={() => setOpenTaskKey(t.taskKey)}
                          style={{ cursor: 'pointer' }}
                        >
                          {t.approved && <div className="task-approval-status approved">Approved</div>}
                          <div className="task-name-row">
                            <span className="task-name-text">{t.name}</span>
                            {st === 'Done' && <span style={{ color: '#52c41a' }}><CheckIcon /></span>}
                          </div>
                          <div className={`task-deadline-text ${st !== 'Done' ? 'overdue' : 'normal'}`}>
                            Deadline: 20 Mar 2026
                          </div>
                          {INCIDENTAL_TASKS.includes(t.name) && incidentalDrafts[t.taskKey] && st !== 'Done' && (
                            <button
                              onClick={e => { e.stopPropagation(); setOpenTaskKey(t.taskKey); }}
                              style={{
                                marginTop: 4, background: '#E3F2FD', color: '#006EC3',
                                border: '1px solid #BBDEFB', borderRadius: 3, padding: '2px 8px',
                                fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                              }}
                            >Show Draft</button>
                          )}
                        </div>

                        <div className="task-cell-status" onClick={e => e.stopPropagation()}>
                          <div className="task-status-dropdown">
                            <select
                              className="task-status-select"
                              value={st}
                              onChange={e => handleStatusChange(t.taskKey, e.target.value)}
                              style={{ background: stObj.bg, color: stObj.c }}
                            >
                              {STATUS_OPTS.map(s => (
                                <option key={s.v} value={s.v}>{s.v}</option>
                              ))}
                            </select>
                            {st === 'Done' && (
                              <span className="task-status-check" style={{ color: '#0F6E3C' }}><CheckIcon /></span>
                            )}
                          </div>
                          <div className="task-status-time">14 days ago</div>
                        </div>

                        <div className="task-cell-assignee">
                          <div className="task-assignee-user">
                            {t.persona === 'Shipper' ? 'Ops | RBL' : `Demo ${t.persona}`}
                          </div>
                          <div className="task-assignee-org">
                            {t.persona === 'Shipper' ? 'Reliance' : t.persona}
                          </div>
                        </div>

                        <div className="task-cell-action">
                          <button className="task-watcher-btn" title="Watch"><EyeIcon /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TasksListSequenced;
