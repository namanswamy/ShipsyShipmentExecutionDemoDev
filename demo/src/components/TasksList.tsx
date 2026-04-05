import React, { useState, useMemo, useEffect } from 'react';
import type { Task } from '../data/tasks';
import { milestones, STATUS_OPTS } from '../data/tasks';
import TaskDetail from './TaskDetail';

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

// Pre-set some tasks as Done for the first shipment demo
const defaultStatuses: Record<number, string> = {
  1: 'Done', 2: 'Done', 3: 'Done',
};

interface Props {
  tasks: Task[];
  incoterm: string;
  shipmentId: string | null;
}

const TasksList: React.FC<Props> = ({ tasks: personaTasks, incoterm, shipmentId }) => {
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<Record<number, string>>(defaultStatuses);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    'Origin': true, 'In Transit': true, 'Destination': true,
  });

  // Reset to default view when shipment changes
  useEffect(() => {
    setOpenTaskId(null);
    setStatuses(defaultStatuses);
    setCollapsed({ 'Origin': true, 'In Transit': true, 'Destination': true });
  }, [shipmentId]);

  const grouped = useMemo(() => {
    const g: Record<string, Task[]> = {};
    milestones.forEach(m => { g[m] = personaTasks.filter(t => t.ms === m); });
    return g;
  }, [personaTasks]);

  const getStatus = (id: number) => statuses[id] || 'Not Started';

  if (openTaskId) {
    const task = personaTasks.find(t => t.id === openTaskId);
    if (task) return <TaskDetail task={task} incoterm={incoterm} onClose={() => setOpenTaskId(null)} />;
  }

  return (
    <div className="tasks-container">
      {milestones.map(ms => {
        const msTasks = grouped[ms] || [];
        if (msTasks.length === 0) return null;
        const total = msTasks.length;
        const done = msTasks.filter(t => getStatus(t.id) === 'Done').length;
        const overdue = ms === 'Drafts' ? 1 : ms === 'Origin' ? 1 : 0;
        const isOpen = !collapsed[ms];
        const allDone = done === total && total > 0;
        const successPct = total ? (done / total) * 100 : 0;
        const overduePct = total && overdue ? (overdue / total) * 100 : 0;

        return (
          <div key={ms} className="ms-section">
            {/* Collapse header */}
            <div
              className={`ms-collapse-header ${allDone ? 'done' : 'pending'}`}
              onClick={() => setCollapsed({ ...collapsed, [ms]: !collapsed[ms] })}
            >
              <div className="ms-collapse-left">
                <span
                  className="ms-collapse-arrow"
                  style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                >
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
                    {overduePct > 0 && (
                      <span
                        className="ms-progress-overdue"
                        style={{ left: `${successPct}%`, width: `${overduePct}%` }}
                      />
                    )}
                  </span>
                </div>
                {overdue > 0 && (
                  <div className="ms-overdue-info">
                    <span className="ms-overdue-count">{overdue}</span>
                    <span className="ms-overdue-label">Task(s) crossed deadline</span>
                  </div>
                )}
              </div>
              <button className="ms-add-task-btn" onClick={e => { e.stopPropagation(); }}>
                + Add Task
              </button>
            </div>

            {/* Task table */}
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
                  const st = getStatus(t.id);
                  const stObj = STATUS_OPTS.find(s => s.v === st) || STATUS_OPTS[0];
                  const isDeadlinePast = true; // demo: all deadlines passed for realism

                  return (
                    <div
                      key={t.id}
                      className={`task-row ${isDeadlinePast && st !== 'Done' ? 'deadline-passed' : ''}`}
                    >
                      {/* S.N. */}
                      <div className="task-cell-sn">{idx + 1}</div>

                      {/* Task Name */}
                      <div className="task-cell-name" onClick={() => setOpenTaskId(t.id)}>
                        {t.approved && (
                          <div className="task-approval-status approved">Approved</div>
                        )}
                        <div className="task-name-row">
                          <span className="task-name-text">{t.name}</span>
                          {st === 'Done' && (
                            <span className="task-name-check" style={{ color: '#52c41a' }}>
                              <CheckIcon />
                            </span>
                          )}
                        </div>
                        <div className={`task-deadline-text ${st !== 'Done' ? 'overdue' : 'normal'}`}>
                          Deadline: 20 Mar 2026
                        </div>
                      </div>

                      {/* Status */}
                      <div className="task-cell-status" onClick={e => e.stopPropagation()}>
                        <div className="task-status-dropdown">
                          <select
                            className="task-status-select"
                            value={st}
                            onChange={e => setStatuses({ ...statuses, [t.id]: e.target.value })}
                            style={{ background: stObj.bg, color: stObj.c }}
                          >
                            {STATUS_OPTS.map(s => (
                              <option key={s.v} value={s.v}>{s.v}</option>
                            ))}
                          </select>
                          {st === 'Done' && (
                            <span className="task-status-check" style={{ color: '#0F6E3C' }}>
                              <CheckIcon />
                            </span>
                          )}
                        </div>
                        <div className="task-status-time">14 days ago</div>
                      </div>

                      {/* Assignee */}
                      <div className="task-cell-assignee">
                        <div className="task-assignee-user">
                          {t.team ? `${t.team} |` : ''} RBL
                        </div>
                        <div className="task-assignee-org">{t.assignee}</div>
                      </div>

                      {/* Watcher */}
                      <div className="task-cell-action">
                        <button className="task-watcher-btn" title="Watch">
                          <EyeIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TasksList;
