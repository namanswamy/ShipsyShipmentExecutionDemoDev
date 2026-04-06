import React from 'react';
import type { ShipmentData } from '../data/tasks';

const milestoneLabels: Record<string, string> = {
  DRAFT: 'Drafts', AT_ORIGIN: 'Origin', IN_TRANSIT: 'In Transit',
  TRANSSHIPMENT: 'Transhipment', DESTINATION: 'Destination',
  COMPLETED: 'Completed', ON_HOLD: 'On Hold',
};

const FlagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" strokeWidth="1.5">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);
const TaskIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const ModeIconSvg: React.FC<{ mode: string }> = ({ mode }) => {
  if (mode === 'FCL') return (
    <svg width="14" height="12" viewBox="0 0 24 18" fill="none" stroke="#333" strokeWidth="1.5">
      <rect x="1" y="3" width="22" height="12" rx="1"/><line x1="1" y1="9" x2="23" y2="9"/><line x1="8" y1="3" x2="8" y2="15"/><line x1="16" y1="3" x2="16" y2="15"/>
    </svg>
  );
  if (mode === 'LCL') return (
    <svg width="14" height="12" viewBox="0 0 24 18" fill="none" stroke="#333" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="12" rx="1"/><polyline points="3 5 12 1 21 5"/>
    </svg>
  );
  if (mode === 'AIR' || mode === 'Air') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
      <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>
    </svg>
  );
  // Break Bulk / BB / BULK
  return (
    <svg width="14" height="12" viewBox="0 0 24 18" fill="none" stroke="#333" strokeWidth="1.5">
      <rect x="1" y="3" width="22" height="12" rx="1"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
};

interface Props {
  data: ShipmentData;
  selected: boolean;
  onClick: () => void;
  spotNormalOverride?: 'Spot' | 'Normal' | null;
}

const ShipmentCard: React.FC<Props> = ({ data, selected, onClick, spotNormalOverride }) => {
  const alerts: string[] = [];
  if (data.tasksDueTodayCount > 0) alerts.push(`${data.tasksDueTodayCount} Task(s) Due Today`);
  if (data.tasksOverdueCount > 0) alerts.push(`${data.tasksOverdueCount} Task(s) Overdue`);

  // Determine spot/normal: override from live state takes priority, then static data
  const spotNormal = spotNormalOverride || data.spotNormal || null;

  const borderClass = spotNormal === 'Spot' ? 'spot-border' : spotNormal === 'Normal' ? 'normal-border' : '';

  return (
    <div className={`s-card ${selected ? 'selected' : ''} ${borderClass}`} onClick={onClick}>
      {/* Header */}
      <div className="s-card-header">
        <div className="s-card-header-left">
          <span className="s-card-ref">{data.masterReferenceNumber}</span>
          <span className="s-card-mode-icon"><ModeIconSvg mode={data.mode} /></span>
          <span className="s-card-mode-label">{data.mode}</span>
          <span className="s-card-dot" />
          <span className="s-card-type">{data.type}</span>
          <span className="s-card-dot" />
          <span className="s-card-type">{data.incoterm}</span>
          {spotNormal && (
            <span className={`s-card-spot-badge ${spotNormal === 'Spot' ? 'spot' : 'normal-rfq'}`}>
              {spotNormal === 'Spot' ? 'SPOT' : 'NORMAL'}
            </span>
          )}
        </div>
        {data.supplierName && (
          <div className="s-card-header-right">
            <span className="s-card-supplier-name">{data.supplierName}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="s-card-body">
        <div className="s-card-body-left">
          <div className="s-card-port">
            <div className="s-card-port-code">{data.originPortCode}</div>
            <div className="s-card-port-name">{data.originPortName}</div>
          </div>
          <div className="s-card-route-line" />
          <div className="s-card-port">
            <div className="s-card-port-code">{data.destinationPortCode}</div>
            <div className="s-card-port-name">{data.destinationPortName}</div>
          </div>
        </div>

        {data.carrierLogo && (
          <div className="s-card-carrier-logo">
            <span style={{
              fontWeight: 700, fontSize: 14, color: data.carrierLogo === 'MSC' ? '#002B5C' : '#006341',
              letterSpacing: 1,
            }}>
              {data.carrierLogo}
            </span>
          </div>
        )}

        <div className="s-card-body-right">
          <div className="s-card-milestone-badge">
            <FlagIcon />
            <span>{milestoneLabels[data.milestone] || data.milestoneLabel}</span>
          </div>
          <div className="s-card-tasks-badge">
            <TaskIcon />
            <span className="s-card-tasks-done">{data.tasksDone}</span>
            <span>/{data.tasksTotal}</span>
          </div>
          <div className="s-card-watcher" title="Toggle Watch">
            <EyeIcon />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="s-card-footer">
        <div className="s-card-cargo">
          {data.cargoType}
          {data.cargoSubtype && <span>&nbsp;| {data.cargoSubtype}</span>}
        </div>
        <div className="s-card-footer-right">
          {data.containerList.length > 0 && (
            <span className="s-card-containers">
              {data.containerList.length} Container{data.containerList.length > 1 ? 's' : ''}
            </span>
          )}
          {data.apiBadge && (
            <div className={`s-card-api-badge ${data.apiBadgeType || 'error'}`}>
              {data.apiBadge}
            </div>
          )}
          {alerts.length > 0 && (
            <div className="s-card-alert">{alerts.join(' | ')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
