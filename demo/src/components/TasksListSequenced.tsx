import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ResolvedTask, ShipmentMode } from '../data/taskSequence';
import { TASK_FIELDS } from '../data/taskFields';
import TaskDetail from './TaskDetail';
import GPOTaskView from './GPOTaskView';
import type { GPOResult } from './GPOTaskView';
import IncidentalChargesView from './IncidentalChargesView';
import type { IncidentalDraft } from './IncidentalChargesView';
import MultiVendorWrapper, { isMultiVendorPersona, getDefaultVendorNames } from './MultiVendorWrapper';
import ChargeInvoiceView from './ChargeInvoiceView';
import type { ChargeInvoiceData, TPChargeRow } from './ChargeInvoiceView';
import { getBidsForVendors } from '../data/bidData';

const milestones = ['Drafts', 'Origin', 'In Transit', 'Destination'];

const STATUS_OPTS = [
  { v: 'Not Started', bg: '#F4F4F4', c: '#555' },
  { v: 'In Progress', bg: '#FFFED2', c: '#8B7000' },
  { v: 'Done', bg: '#D3FFEA', c: '#0F6E3C' },
  { v: 'Pending', bg: '#FFF3E0', c: '#E65100' },
  { v: 'Sent for Approval', bg: '#E3F2FD', c: '#1565C0' },
  { v: 'Rejected', bg: '#FFD3D3', c: '#A00' },
  { v: 'Approved', bg: '#D3FFEA', c: '#0F6E3C' },
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
  onVendorSelected: (vendor: 'CFS' | 'ICD' | null) => void;
  onVisiblePersonasChange: (personas: string[]) => void;
  // Lifted state from ActionsPanel (Fix 4)
  statuses: Record<string, string>;
  setStatuses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savedFields: Record<string, Record<string, string>>;
  setSavedFields: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
  vendorSelections: string[];
  setVendorSelections: React.Dispatch<React.SetStateAction<string[]>>;
  gpoResult: GPOResult | null;
  setGpoResult: React.Dispatch<React.SetStateAction<GPOResult | null>>;
  portDetails: { pol: string; pod: string };
  setPortDetails: React.Dispatch<React.SetStateAction<{ pol: string; pod: string }>>;
  isSpot: boolean;
  setIsSpot: React.Dispatch<React.SetStateAction<boolean>>;
  incidentalDrafts: Record<string, IncidentalDraft>;
  setIncidentalDrafts: React.Dispatch<React.SetStateAction<Record<string, IncidentalDraft>>>;
  openTaskKey: string | null;
  setOpenTaskKey: React.Dispatch<React.SetStateAction<string | null>>;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  multiVendorSubmitted: Record<string, Set<number>>;
  setMultiVendorSubmitted: React.Dispatch<React.SetStateAction<Record<string, Set<number>>>>;
  confirmedVendors: Record<string, string[]>;
  setConfirmedVendors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onSpotNormalChange?: (value: 'Spot' | 'Normal') => void;
}

const TasksListSequenced: React.FC<Props> = ({
  allTasks, activePersona, incoterm, shipmentMode, onVendorSelected, onVisiblePersonasChange,
  statuses, setStatuses,
  savedFields, setSavedFields,
  vendorSelections, setVendorSelections,
  gpoResult, setGpoResult,
  portDetails, setPortDetails,
  isSpot, setIsSpot,
  incidentalDrafts, setIncidentalDrafts,
  openTaskKey, setOpenTaskKey,
  collapsed, setCollapsed,
  multiVendorSubmitted, setMultiVendorSubmitted,
  confirmedVendors, setConfirmedVendors,
  onSpotNormalChange,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [l1RejectionRemarks, setL1RejectionRemarks] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fix 3: Close open task when persona switches
  useEffect(() => {
    setOpenTaskKey(null);
  }, [activePersona]);

  const getStatus = (key: string) => statuses[key] || 'Not Started';

  const currentActiveSeq = useMemo(() => {
    for (const t of allTasks) {
      const st = getStatus(t.taskKey);
      if (st !== 'Done' && st !== 'Sent for Approval' && st !== 'Rejected' && st !== 'Approved') return t.seq;
    }
    return Infinity;
  }, [allTasks, statuses]);

  const visibleTasks = useMemo(
    () => allTasks.filter(t => t.seq <= currentActiveSeq),
    [allTasks, currentActiveSeq]
  );

  // Report which personas have visible tasks
  // Depend on statuses too so this re-fires when switching between shipments
  // with identical task structures but different status maps
  useEffect(() => {
    const personaSet = new Set(visibleTasks.map(t => t.persona));
    personaSet.add('Shipper'); // Always show Shipper
    onVisiblePersonasChange(Array.from(personaSet));
  }, [visibleTasks, statuses, onVisiblePersonasChange]);

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
        const spotVal = fieldValues['Spot / Normal'] === 'Spot';
        setIsSpot(spotVal);
        onSpotNormalChange?.(spotVal ? 'Spot' : 'Normal');
      }

      // Extract confirmed vendors from CFS/ICD/Transporter confirmation tasks
      if (task?.name === 'Confirm CFS Vendor' && fieldValues['CFS Vendors']) {
        setConfirmedVendors(prev => ({ ...prev, 'CFS': fieldValues['CFS Vendors'].split(', ').filter(Boolean) }));
      }
      if (task?.name === 'Confirm ICD Vendor' && fieldValues['ICD Vendors']) {
        setConfirmedVendors(prev => ({ ...prev, 'ICD': fieldValues['ICD Vendors'].split(', ').filter(Boolean) }));
      }
      if (task?.name === 'Transporter Confirmation' && fieldValues['Transporter']) {
        setConfirmedVendors(prev => ({ ...prev, 'Transporter': fieldValues['Transporter'].split(', ').filter(Boolean) }));
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
    setL1RejectionRemarks('');
    handleSubmitTask(openTaskKey!);
  };

  // Handle L1 Rejection
  const handleL1Reject = (remarks: string) => {
    setL1RejectionRemarks(remarks);
    const gpoTask = allTasks.find(t => t.name === 'Run Global Plan Optimizer');
    const l1Task = allTasks.find(t => t.name === 'Approval of L1 Deviation');
    if (gpoTask) setStatuses(prev => ({ ...prev, [gpoTask.taskKey]: 'Rejected' }));
    if (l1Task) setStatuses(prev => ({ ...prev, [l1Task.taskKey]: 'Rejected' }));
    setOpenTaskKey(null);
    setToastMessage('L1 Deviation Rejected — GPO sent for Rework');
  };

  // Incidental task names
  const INCIDENTAL_TASKS = [
    'FF Incidental Events', 'CHA Incidental Events',
    'CFS Incidental Events', 'ICD Incidental Events', 'Transporter Incidental Events',
  ];

  // Charge Confirmation & Invoicing task names
  const CHARGE_INVOICE_TASKS = [
    'FF Charge Confirmation & Invoicing', 'CHA Charge Confirmation & Invoicing',
  ];

  // Build charge & invoice data for a vendor type
  const buildChargeInvoiceData = (vendorType: string): ChargeInvoiceData => {
    // Get GPO bid for this vendor
    const vendorTypeMap: Record<string, string> = {
      'FF': 'Freight Forwarder', 'CHA': 'CHA', 'CFS': 'CFS', 'ICD': 'ICD', 'Transporter': 'Transporter',
    };
    const gpoVendorKey = vendorTypeMap[vendorType] || vendorType;
    const allBids = getBidsForVendors([gpoVendorKey], portDetails.pol, portDetails.pod);
    // Use rank 1 bid as the selected one (or from gpoResult if available)
    let selectedBid = allBids.find(b => b.rank === 1) || null;
    if (gpoResult?.selectedBids?.[gpoVendorKey]) {
      const selectedId = gpoResult.selectedBids[gpoVendorKey];
      const fromResult = gpoResult.allBids?.find(b => b.id === selectedId);
      if (fromResult) selectedBid = fromResult;
    }

    if (vendorType === 'FF') {
      return {
        vendorType: 'Freight Forwarder',
        vendorLabel: 'FF',
        gpoBid: selectedBid,
        incidentalCharges: [
          { id: 'ic-1', chargeName: 'Loading charges', level: 'BL', vendorPrice: '800', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '18% GST', total: '944.00' },
          { id: 'ic-2', chargeName: 'Storage charges', level: 'Container', vendorPrice: '500', currency: 'USD', unitType: 'Per Container', units: '2.00', tax: '18% GST', total: '1180.00' },
        ],
        selfReimbCharges: [
          { id: 'sr-1', chargeName: 'Documentation charges', level: 'BL', vendorPrice: '950', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '', total: '950.00' },
        ],
        thirdPartyCharges: [
          { id: 'tp-1', chargeName: 'License charges', level: 'Container', vendorPrice: '300', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '354.00', invoiceNo: 'INV301', invoiceDate: '15-03-2026', basicValue: '300.00', cgst: '27.00', sgst: '27.00', igst: '', vendorCode: 'VND002', vendorName: 'XYZ Freight Services' },
          { id: 'tp-2', chargeName: 'License charges', level: 'Container', vendorPrice: '300', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '354.00', invoiceNo: 'INV302', invoiceDate: '15-03-2026', basicValue: '300.00', cgst: '27.00', sgst: '27.00', igst: '', vendorCode: 'VND002', vendorName: 'XYZ Freight Services' },
        ] as TPChargeRow[],
      };
    }

    // CHA
    return {
      vendorType: 'CHA',
      vendorLabel: 'CHA',
      gpoBid: selectedBid,
      incidentalCharges: [
        { id: 'ic-1', chargeName: 'Loading charges', level: 'BL', vendorPrice: '800', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '18% GST', total: '944.00' },
        { id: 'ic-2', chargeName: 'Storage charges', level: 'Container', vendorPrice: '500', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '590.00' },
      ],
      selfReimbCharges: [
        { id: 'sr-1', chargeName: 'Documentation charges', level: 'BL', vendorPrice: '1200', currency: 'USD', unitType: 'Per BL', units: '1.00', tax: '', total: '1200.00' },
        { id: 'sr-2', chargeName: 'Special equipment charges', level: 'Container', vendorPrice: '450', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '', total: '450.00' },
      ],
      thirdPartyCharges: [
        { id: 'tp-1', chargeName: 'License charges', level: 'Container', vendorPrice: '350', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '413.00', invoiceNo: 'INV201', invoiceDate: '18-03-2026', basicValue: '350.00', cgst: '31.50', sgst: '31.50', igst: '', vendorCode: 'VND003', vendorName: 'PQR Shipping Agency' },
        { id: 'tp-2', chargeName: 'Registration charges', level: 'Container', vendorPrice: '400', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '472.00', invoiceNo: 'INV202', invoiceDate: '18-03-2026', basicValue: '400.00', cgst: '36.00', sgst: '36.00', igst: '', vendorCode: 'VND004', vendorName: 'Global Trade Solutions' },
        { id: 'tp-3', chargeName: 'Registration charges', level: 'Container', vendorPrice: '400', currency: 'USD', unitType: 'Per Container', units: '1.00', tax: '18% GST', total: '472.00', invoiceNo: 'INV203', invoiceDate: '18-03-2026', basicValue: '400.00', cgst: '36.00', sgst: '36.00', igst: '', vendorCode: 'VND004', vendorName: 'Global Trade Solutions' },
      ] as TPChargeRow[],
    };
  };

  // Fix 1: Multi-vendor submit logic — mark vendor as submitted, complete task only when all done
  const handleMultiVendorSubmit = useCallback((taskKey: string, vendorIdx: number, totalVendors: number, fieldValues?: Record<string, string>) => {
    const fieldKey = `${taskKey}-v${vendorIdx}`;
    if (fieldValues) {
      setSavedFields(prev => ({ ...prev, [fieldKey]: fieldValues }));
    }

    setMultiVendorSubmitted(prev => {
      const existing = prev[taskKey] ? new Set(prev[taskKey]) : new Set<number>();
      existing.add(vendorIdx);
      const updated = { ...prev, [taskKey]: existing };

      // If all vendors submitted, complete the task
      if (existing.size >= totalVendors) {
        processTaskCompletion(taskKey, true);
      } else {
        // Mark as Pending when at least one vendor submitted
        setStatuses(prev => ({ ...prev, [taskKey]: 'Pending' }));
        setToastMessage(`Vendor ${vendorIdx + 1} submitted successfully`);
      }

      return updated;
    });
  }, [processTaskCompletion, setSavedFields, setMultiVendorSubmitted]);

  // Open task detail
  if (openTaskKey && !isProcessing) {
    const task = allTasks.find(t => t.taskKey === openTaskKey);
    if (task) {
      // Charge Confirmation & Invoicing tasks
      if (CHARGE_INVOICE_TASKS.includes(task.name)) {
        const vendorType = task.name.replace(' Charge Confirmation & Invoicing', '');
        const chargeData = buildChargeInvoiceData(vendorType);
        return (
          <ChargeInvoiceView
            taskName={task.name}
            data={chargeData}
            onClose={() => setOpenTaskKey(null)}
            onSubmit={() => handleSubmitTask(openTaskKey!)}
            onStatusChange={(status) => {
              if (status === 'Pending') {
                setStatuses(prev => ({ ...prev, [openTaskKey!]: 'Pending' }));
              }
              // Done is handled by handleSubmitTask via onSubmit
            }}
          />
        );
      }

      // Incidental Charges tasks
      if (INCIDENTAL_TASKS.includes(task.name)) {
        const isMultiVendor = isMultiVendorPersona(task.persona);
        const vendors = isMultiVendor ? (confirmedVendors[task.persona]?.length ? confirmedVendors[task.persona] : getDefaultVendorNames(task.persona)) : [task.persona];
        const totalVendors = vendors.length;

        const incidentalContent = (vendorIdx: number, _vendorName: string) => {
          const draftKey = isMultiVendor ? `${openTaskKey}-v${vendorIdx}` : openTaskKey!;
          const submitted = isMultiVendor
            ? (multiVendorSubmitted[openTaskKey!] || new Set<number>()).has(vendorIdx)
            : false;
          return (
            <IncidentalChargesView
              key={draftKey}
              taskName={task.name}
              onClose={() => setOpenTaskKey(null)}
              onSendForApproval={() => {
                if (isMultiVendor) {
                  handleMultiVendorSubmit(openTaskKey!, vendorIdx, totalVendors);
                } else {
                  setIsProcessing(true);
                  const key = openTaskKey!;
                  setOpenTaskKey(null);
                  setTimeout(() => {
                    setStatuses(prev => ({ ...prev, [key]: 'Sent for Approval' }));
                    setIsProcessing(false);
                    setToastMessage('Sent for Approval successfully');
                  }, 1000);
                }
              }}
              savedDraft={incidentalDrafts[draftKey] || null}
              onSaveDraft={(draft) => {
                setIncidentalDrafts(prev => ({ ...prev, [draftKey]: draft }));
                setOpenTaskKey(null);
              }}
              submitted={submitted}
            />
          );
        };

        if (isMultiVendor) {
          const submittedSet = multiVendorSubmitted[openTaskKey!] || new Set<number>();
          return (
            <div className="task-detail">
              <div className="task-detail-header">
                <div className="task-detail-header-left">
                  <button className="task-detail-close" onClick={() => setOpenTaskKey(null)}>&#10005;</button>
                  <span className="task-detail-title">{task.name}</span>
                  <span className="task-detail-deadline-wrap">
                    <span className="task-detail-deadline-label">Deadline:</span>
                    <span className="task-detail-deadline-value">20 Mar 2026</span>
                  </span>
                </div>
              </div>
              <MultiVendorWrapper persona={task.persona} vendorNames={confirmedVendors[task.persona] || []} submittedIndices={submittedSet}>
                {(vendorIdx, vendorName) => incidentalContent(vendorIdx, vendorName)}
              </MultiVendorWrapper>
            </div>
          );
        }
        return incidentalContent(0, task.persona);
      }

      // GPO Task — show bid cards
      if (task.name === 'Run Global Plan Optimizer') {
        const gpoStatus = getStatus(task.taskKey);
        const isRework = gpoStatus === 'Rejected';
        const isInProgress = gpoStatus === 'In Progress';
        // Rework mode: show banner but read-only. In Progress after rework: editable.
        const gpoReadOnly = isRework && !isInProgress;
        return (
          <GPOTaskView
            selectedVendors={vendorSelections}
            pol={portDetails.pol}
            pod={portDetails.pod}
            isSpot={isSpot}
            onClose={() => setOpenTaskKey(null)}
            onSubmit={(result) => {
              // On re-submit after rework, reset L1
              if (l1RejectionRemarks) {
                const l1Task = allTasks.find(t => t.name === 'Approval of L1 Deviation');
                if (l1Task) setStatuses(prev => ({ ...prev, [l1Task.taskKey]: 'Not Started' }));
                setL1RejectionRemarks('');
              }
              handleGPOSubmit(result);
            }}
            readOnly={gpoReadOnly}
            previousResult={isRework ? gpoResult : undefined}
            rejectionRemarks={l1RejectionRemarks || undefined}
            reworkMode={isRework}
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
            onReject={handleL1Reject}
          />
        );
      }

      // Regular task detail
      const isMultiVendor = isMultiVendorPersona(task.persona);
      const vendors = isMultiVendor ? (confirmedVendors[task.persona]?.length ? confirmedVendors[task.persona] : getDefaultVendorNames(task.persona)) : [task.assignee === 'Ops' ? 'Reliance' : task.assignee];
      const totalVendors = vendors.length;

      const regularContent = (vendorIdx: number, vendorName: string) => {
        const fieldKey = isMultiVendor ? `${openTaskKey}-v${vendorIdx}` : openTaskKey!;
        const fieldDef = TASK_FIELDS[task.name];
        const taskObj = {
          id: task.seq,
          name: task.name,
          org: task.persona,
          code: task.taskKey,
          team: task.assignee,
          ms: task.milestone,
          assignee: vendorName,
          approved: task.approved,
          isNew: task.isNew,
          fields: fieldDef?.fields || [],
          docFields: fieldDef?.docFields,
          docName: fieldDef?.docName,
        };
        const isVendorSubmitted = isMultiVendor
          ? (multiVendorSubmitted[openTaskKey!] || new Set<number>()).has(vendorIdx)
          : false;
        return (
          <TaskDetail
            key={fieldKey}
            task={taskObj}
            incoterm={incoterm}
            shipmentMode={shipmentMode}
            onClose={() => setOpenTaskKey(null)}
            onVendorSelected={onVendorSelected}
            onSubmit={(fieldValues) => {
              if (isMultiVendor) {
                handleMultiVendorSubmit(openTaskKey!, vendorIdx, totalVendors, fieldValues);
              } else {
                if (fieldValues) {
                  setSavedFields(prev => ({ ...prev, [fieldKey]: fieldValues }));
                }
                handleSubmitTask(openTaskKey!, fieldValues);
              }
            }}
            onVendorTaskSubmit={task.name === 'Vendor Selection' ? handleVendorTaskSubmit : undefined}
            savedFieldValues={savedFields[fieldKey]}
            hideHeader={isMultiVendor}
            submitted={isVendorSubmitted}
          />
        );
      };

      if (isMultiVendor) {
        const submittedSet = multiVendorSubmitted[openTaskKey!] || new Set<number>();
        return (
          <div className="task-detail">
            <div className="task-detail-header">
              <div className="task-detail-header-left">
                <button className="task-detail-close" onClick={() => setOpenTaskKey(null)}>&#10005;</button>
                <span className="task-detail-title">{task.name}</span>
                <span className="task-detail-deadline-wrap">
                  <span className="task-detail-deadline-label">Deadline:</span>
                  <span className="task-detail-deadline-value">20 Mar 2026</span>
                </span>
              </div>
            </div>
            <MultiVendorWrapper persona={task.persona} vendorNames={confirmedVendors[task.persona] || []} submittedIndices={submittedSet}>
              {(vendorIdx, vendorName) => regularContent(vendorIdx, vendorName)}
            </MultiVendorWrapper>
          </div>
        );
      }
      return regularContent(0, task.assignee === 'Ops' ? 'Reliance' : task.assignee);
    }
  }

  const hasAnyTasks = personaTasks.length > 0;

  return (
    <div className="tasks-container" style={{ position: 'relative' }}>
      {/* Fix 5: Full-screen loading overlay */}
      {isProcessing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
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
                          {/* Fix 2: "Show Draft" button removed from task list row */}
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
