import React, { useState } from 'react';
import type { Task, Field } from '../data/tasks';

// Vendor Selection AddMore with:
// 1. No duplicate vendors across rows
// 2. CFS/ICD mutually exclusive
// 3. Reports selected values up so parent can show/hide conditional fields
interface VendorAddMoreProps {
  f: Field;
  onSelectionChange: (selected: string[]) => void;
}

const VendorAddMoreField: React.FC<VendorAddMoreProps> = ({ f, onSelectionChange }) => {
  const [rows, setRows] = useState<string[]>(['']);
  const allOpts = f.opts || [];

  const getAvailableOpts = (currentRowIndex: number) => {
    const selectedInOtherRows = rows.filter((_, i) => i !== currentRowIndex).filter(v => v !== '');
    const currentVal = rows[currentRowIndex];

    // CFS/ICD mutual exclusion
    const hasCFS = rows.some((v, i) => i !== currentRowIndex && v === 'CFS');
    const hasICD = rows.some((v, i) => i !== currentRowIndex && v === 'ICD');

    return allOpts.filter(opt => {
      // Don't show options already selected in other rows
      if (selectedInOtherRows.includes(opt) && opt !== currentVal) return false;
      // If CFS is selected elsewhere, hide ICD (and vice versa)
      if (hasCFS && opt === 'ICD') return false;
      if (hasICD && opt === 'CFS') return false;
      // If current row has CFS, still hide ICD from this row, and vice versa
      if (currentVal === 'CFS' && opt === 'ICD') return false;
      if (currentVal === 'ICD' && opt === 'CFS') return false;
      return true;
    });
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index] = value;
    setRows(updated);
    onSelectionChange(updated.filter(v => v !== ''));
  };

  const handleRemove = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onSelectionChange(updated.filter(v => v !== ''));
  };

  const handleAddMore = () => {
    setRows([...rows, '']);
  };

  // Check if there are any unselected options left
  const selectedValues = rows.filter(v => v !== '');
  const hasCFS = selectedValues.includes('CFS');
  const hasICD = selectedValues.includes('ICD');
  let remainingCount = allOpts.filter(opt => {
    if (selectedValues.includes(opt)) return false;
    if (hasCFS && opt === 'ICD') return false;
    if (hasICD && opt === 'CFS') return false;
    return true;
  }).length;

  return (
    <div>
      {rows.map((val, i) => (
        <div key={i} className="addmore-row">
          <select
            className="field-select"
            style={{ flex: 1 }}
            value={val}
            onChange={e => handleChange(i, e.target.value)}
          >
            <option value="">Select...</option>
            {getAvailableOpts(i).map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {rows.length > 1 && (
            <button className="addmore-remove" onClick={() => handleRemove(i)}>
              &#10005;
            </button>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <button className="addmore-add" onClick={handleAddMore}>
          <span style={{ fontSize: 16, lineHeight: '1' }}>+</span> Add More
        </button>
      )}
    </div>
  );
};

// Generic AddMore (for non-vendor tasks like Incidental Charges)
const AddMoreField: React.FC<{ f: Field }> = ({ f }) => {
  const [rows, setRows] = useState(['']);
  return (
    <div>
      {rows.map((_, i) => (
        <div key={i} className="addmore-row">
          <select className="field-select" style={{ flex: 1 }}>
            <option value="">Select...</option>
            {(f.opts || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {rows.length > 1 && (
            <button className="addmore-remove" onClick={() => setRows(rows.filter((__, j) => j !== i))}>
              &#10005;
            </button>
          )}
        </div>
      ))}
      <button className="addmore-add" onClick={() => setRows([...rows, ''])}>
        <span style={{ fontSize: 16, lineHeight: '1' }}>+</span> Add More
      </button>
    </div>
  );
};

const FieldInput: React.FC<{ f: Field }> = ({ f }) => {
  if (f.type === 'auto') return <div className="field-auto">{f.value || 'Auto-populated'}</div>;
  if (f.type === 'upload') return <button className="field-upload-btn">&#11014; Choose file</button>;
  if (f.type === 'addmore') return <AddMoreField f={f} />;
  if (f.type === 'dropdown' || f.type === 'multiselect') {
    return (
      <select className="field-select" defaultValue={f.defaultVal || ''}>
        {!f.defaultVal && <option value="" disabled>Select...</option>}
        {(f.opts || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (f.type === 'date' || f.type === 'datetime') {
    return <input className="field-input" type={f.type === 'datetime' ? 'datetime-local' : 'date'} />;
  }
  return <input className="field-input" type={f.type === 'number' ? 'number' : 'text'} placeholder="Enter value" />;
};

interface Props {
  task: Task;
  onClose: () => void;
}

const TaskDetail: React.FC<Props> = ({ task, onClose }) => {
  const [markDone, setMarkDone] = useState(true);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const allF = task.fields || [];
  const docF = task.docFields || [];
  const hasF = allF.length > 0 || docF.length > 0;

  // For Task #4 (Vendor Selection): check if CFS or ICD is selected
  const isVendorSelectionTask = task.id === 4;
  const showConditionalFields = selectedVendors.includes('CFS') || selectedVendors.includes('ICD');

  const shouldShowField = (f: Field) => {
    // For vendor selection task, hide conditional fields unless CFS/ICD selected
    if (isVendorSelectionTask && f.note && f.note.includes('If CFS/ICD selected')) {
      return showConditionalFields;
    }
    return true;
  };

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <div className="task-detail-header-left">
          <button className="task-detail-close" onClick={onClose}>&#10005;</button>
          <span className="task-detail-title">{task.name}</span>
          <span className="task-detail-edit">&#9998;</span>
          <span className={`task-detail-code ${task.code === 'TBD' ? 'tbd' : 'existing'}`}>
            {task.code}
          </span>
          <span className="task-detail-deadline-wrap">
            <span className="task-detail-deadline-label">Deadline:</span>
            <span className="task-detail-deadline-value">20 Mar 2026</span>
          </span>
        </div>
        <div className="task-detail-actions">
          {task.approved ? (
            <>
              <button className="btn-reject">Reject</button>
              <button className="btn-approve">Approve</button>
            </>
          ) : (
            <>
              <label className="mark-done-label">
                <input type="checkbox" checked={markDone} onChange={e => setMarkDone(e.target.checked)} />
                Mark this task as done automatically?
              </label>
              <button className="btn-submit">Submit</button>
            </>
          )}
        </div>
      </div>

      <div className="task-detail-body">
        {!hasF ? (
          <div className="system-task-placeholder">
            System task ({task.code}) &mdash; fields rendered by platform
          </div>
        ) : (
          <>
            {allF.length > 0 && (
              <div className="fields-grid">
                {allF.map((f, i) => {
                  if (!shouldShowField(f)) return null;

                  // Special rendering for Vendor Selection addmore field
                  if (isVendorSelectionTask && f.type === 'addmore') {
                    return (
                      <div key={i} className="field-item full-width">
                        <div className="field-label">
                          {f.label}
                          {f.req && <span className="field-required">*</span>}
                          {f.code && <span className="field-code-badge">{f.code}</span>}
                          {f.note && (
                            <span className={`field-note-badge ${task.isNew ? 'new' : 'existing'}`}>
                              {f.note}
                            </span>
                          )}
                        </div>
                        <VendorAddMoreField f={f} onSelectionChange={setSelectedVendors} />
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`field-item ${f.type === 'addmore' ? 'full-width' : ''}`}>
                      <div className="field-label">
                        {f.label}
                        {f.req && <span className="field-required">*</span>}
                        {f.code && <span className="field-code-badge">{f.code}</span>}
                        {f.note && (
                          <span className={`field-note-badge ${task.isNew ? 'new' : 'existing'}`}>
                            {f.note}
                          </span>
                        )}
                      </div>
                      <FieldInput f={f} />
                    </div>
                  );
                })}
              </div>
            )}

            {docF.length > 0 && (
              <div className="doc-section">
                <div className="doc-section-header">
                  <span className="doc-section-title">&#128196; Document: {task.docName}</span>
                  <span className="doc-section-subtitle">(Document-linked fields)</span>
                </div>
                <div className="doc-section-body">
                  <div className="fields-grid">
                    {docF.map((f, i) => (
                      <div key={i} className="field-item">
                        <div className="field-label">
                          {f.label}
                          {f.req && <span className="field-required">*</span>}
                          {f.code && <span className="field-code-badge">{f.code}</span>}
                        </div>
                        <FieldInput f={f} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
