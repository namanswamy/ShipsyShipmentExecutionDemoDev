import React, { useState } from 'react';
import type { Task, Field } from '../data/tasks';

// Vendor Selection AddMore with:
// 1. No duplicate vendors across rows
// 2. CFS/ICD mutually exclusive
// 3. Reports selected values up so parent can show/hide conditional fields
interface VendorAddMoreProps {
  f: Field;
  onSelectionChange: (selected: string[]) => void;
  initialValues?: string[];
}

const VendorAddMoreField: React.FC<VendorAddMoreProps> = ({ f, onSelectionChange, initialValues }) => {
  const [rows, setRows] = useState<string[]>(initialValues && initialValues.length > 0 ? initialValues : ['']);
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
const AddMoreField: React.FC<{ f: Field; value?: string; onChange?: (val: string) => void }> = ({ f, value, onChange }) => {
  const initRows = value ? value.split(', ').filter(Boolean) : [''];
  const [rows, setRows] = useState<string[]>(initRows);
  const allOpts = f.opts || [];

  const getAvailableOpts = (currentIdx: number) => {
    const othersSelected = rows.filter((_, i) => i !== currentIdx).filter(v => v !== '');
    return allOpts.filter(o => !othersSelected.includes(o));
  };

  const handleChange = (idx: number, val: string) => {
    const updated = [...rows];
    updated[idx] = val;
    setRows(updated);
    onChange?.(updated.filter(v => v !== '').join(', '));
  };

  const handleRemove = (idx: number) => {
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated);
    onChange?.(updated.filter(v => v !== '').join(', '));
  };

  const handleAdd = () => {
    setRows([...rows, '']);
  };

  const selectedCount = rows.filter(v => v !== '').length;
  const hasMore = selectedCount < allOpts.length;

  return (
    <div>
      {rows.map((val, i) => (
        <div key={i} className="addmore-row">
          <select className="field-select" style={{ flex: 1 }} value={val} onChange={e => handleChange(i, e.target.value)}>
            <option value="">Select...</option>
            {getAvailableOpts(i).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {rows.length > 1 && (
            <button className="addmore-remove" onClick={() => handleRemove(i)}>
              &#10005;
            </button>
          )}
        </div>
      ))}
      {hasMore && (
        <button className="addmore-add" onClick={handleAdd}>
          <span style={{ fontSize: 16, lineHeight: '1' }}>+</span> Add More
        </button>
      )}
    </div>
  );
};

const FieldInput: React.FC<{ f: Field; value?: string; onChange?: (val: string) => void }> = ({ f, value, onChange }) => {
  const handleChange = (val: string) => onChange?.(val);
  if (f.type === 'auto') return <div className="field-auto">{f.value || 'Auto-populated'}</div>;
  if (f.type === 'upload') return <button className="field-upload-btn">&#11014; Choose file</button>;
  if (f.type === 'addmore') return <AddMoreField f={f} value={value} onChange={onChange} />;
  if (f.type === 'dropdown' || f.type === 'multiselect') {
    return (
      <select className="field-select" value={value ?? f.defaultVal ?? ''} onChange={e => handleChange(e.target.value)}>
        {!f.defaultVal && !value && <option value="" disabled>Select...</option>}
        {(f.opts || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (f.type === 'date' || f.type === 'datetime') {
    return <input className="field-input" type={f.type === 'datetime' ? 'datetime-local' : 'date'} value={value || ''} onChange={e => handleChange(e.target.value)} />;
  }
  return <input className="field-input" type={f.type === 'number' ? 'number' : 'text'} placeholder="Enter value" value={value || ''} onChange={e => handleChange(e.target.value)} />;
};

// ── Container Row Repeater ──
// Renders container fields as repeatable horizontal rows with + Add More
interface ContainerRowRepeaterProps {
  fields: Field[];
  fieldValues: Record<string, string>;
  onFieldChange: (label: string, value: string) => void;
}

const ContainerRowRepeater: React.FC<ContainerRowRepeaterProps> = ({ fields, fieldValues, onFieldChange }) => {
  const [rowCount, setRowCount] = useState(() => {
    // Detect existing rows from saved field values
    let max = 1;
    for (const key of Object.keys(fieldValues)) {
      const match = key.match(/_row(\d+)$/);
      if (match) max = Math.max(max, parseInt(match[1]) + 1);
    }
    return max;
  });

  const getKey = (label: string, rowIdx: number) => rowIdx === 0 ? label : `${label}_row${rowIdx}`;

  return (
    <div className="container-repeater">
      {/* Column headers */}
      <div className="container-row container-row-header">
        <div className="container-row-num">#</div>
        {fields.map(f => (
          <div key={f.label} className="container-row-cell-header">{f.label}</div>
        ))}
        <div className="container-row-action-header"></div>
      </div>

      {/* Data rows */}
      {Array.from({ length: rowCount }).map((_, rowIdx) => (
        <div key={rowIdx} className="container-row container-row-data">
          <div className="container-row-num">{rowIdx + 1}</div>
          {fields.map(f => {
            const key = getKey(f.label, rowIdx);
            return (
              <div key={f.label} className="container-row-cell">
                <FieldInput f={f} value={fieldValues[key]} onChange={v => onFieldChange(key, v)} />
              </div>
            );
          })}
          <div className="container-row-action">
            {rowCount > 1 && (
              <button
                className="container-row-remove"
                onClick={() => {
                  // Clear values for this row and shift subsequent rows up
                  const newValues = { ...fieldValues };
                  for (let r = rowIdx; r < rowCount - 1; r++) {
                    fields.forEach(f => {
                      const curKey = getKey(f.label, r);
                      const nextKey = getKey(f.label, r + 1);
                      newValues[curKey] = fieldValues[nextKey] || '';
                    });
                  }
                  // Clear last row
                  fields.forEach(f => {
                    const lastKey = getKey(f.label, rowCount - 1);
                    delete newValues[lastKey];
                  });
                  Object.entries(newValues).forEach(([k, v]) => onFieldChange(k, v));
                  setRowCount(prev => prev - 1);
                }}
              >
                &#10005;
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add more button */}
      <button className="container-add-more" onClick={() => setRowCount(prev => prev + 1)}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>+</span> Add More
      </button>
    </div>
  );
};

const C_INCOTERMS = ['CIF', 'CFR', 'CPT', 'CIP'];
const D_INCOTERMS = ['DAP', 'DPU', 'DDP'];

const getVendorOptions = (allOpts: string[], incoterm: string) => {
  if (C_INCOTERMS.includes(incoterm)) {
    // Remove FF and Shipping Line
    return allOpts.filter(o => o !== 'Freight Forwarder' && o !== 'Shipping Line');
  }
  if (D_INCOTERMS.includes(incoterm)) {
    // Only Transporter and Surveyor
    return allOpts.filter(o => o === 'Transporter' || o === 'Surveyor');
  }
  return allOpts;
};

interface Props {
  task: Task;
  incoterm: string;
  shipmentMode?: string;
  onClose: () => void;
  onVendorSelected?: (vendor: 'CFS' | 'ICD' | null) => void;
  onSubmit?: (fieldValues?: Record<string, string>) => void;
  onVendorTaskSubmit?: (vendors: string[]) => void;
  savedFieldValues?: Record<string, string>;
  hideHeader?: boolean;
  submitted?: boolean;
}

// Map shipment mode codes to display values for the Mode dropdown
const MODE_DISPLAY: Record<string, string> = {
  FCL: 'FCL', LCL: 'LCL', AIR: 'Air', BB: 'Break Bulk', BULK: 'Bulk',
};

// Conditional mode options based on shipment card's mode
const SEA_MODES = ['FCL', 'LCL', 'Bulk', 'Break Bulk'];
const AIR_MODES = ['Air'];
const getModeOpts = (shipmentMode?: string): string[] => {
  if (shipmentMode === 'AIR' || shipmentMode === 'Air') return AIR_MODES;
  return SEA_MODES;
};

const TaskDetail: React.FC<Props> = ({ task, incoterm, shipmentMode, onClose, onVendorSelected, onSubmit, onVendorTaskSubmit, savedFieldValues, hideHeader, submitted }) => {
  const [markDone, setMarkDone] = useState(true);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(
    savedFieldValues?.['Vendor Selection'] ? savedFieldValues['Vendor Selection'].split(', ').filter(Boolean) : []
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(savedFieldValues || {});
  const allF = task.fields || [];
  const docF = task.docFields || [];
  const hasF = allF.length > 0 || docF.length > 0;

  const updateField = (label: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [label]: value }));
  };

  const collectAndSubmit = () => {
    if (onSubmit) onSubmit(fieldValues);
  };

  // Auto-fill Mode & Incoterm for "Select Mode of Shipment" task
  const isSelectModeTask = task.name === 'Select Mode of Shipment';
  if (isSelectModeTask && shipmentMode) {
    allF.forEach(f => {
      if (f.label === 'Mode') {
        f.defaultVal = MODE_DISPLAY[shipmentMode] || shipmentMode;
        f.opts = getModeOpts(shipmentMode);
      }
      if (f.label === 'Incoterm') f.defaultVal = incoterm;
    });
  }

  // For Vendor Selection task: check if CFS or ICD is selected
  const isVendorSelectionTask = task.name === 'Vendor Selection';
  const showConditionalFields = selectedVendors.includes('CFS') || selectedVendors.includes('ICD');

  // Notify parent when vendor selection changes
  const handleVendorChange = (vendors: string[]) => {
    setSelectedVendors(vendors);
    if (onVendorSelected) {
      if (vendors.includes('CFS')) onVendorSelected('CFS');
      else if (vendors.includes('ICD')) onVendorSelected('ICD');
      else onVendorSelected(null);
    }
  };

  const shouldShowField = (f: Field) => {
    // For vendor selection task, hide conditional fields unless CFS/ICD selected
    if (isVendorSelectionTask && f.note && f.note.includes('If CFS/ICD selected')) {
      return showConditionalFields;
    }
    return true;
  };

  return (
    <div className="task-detail">
      {!hideHeader && (
        <div className="task-detail-header">
          <div className="task-detail-header-left">
            <button className="task-detail-close" onClick={onClose}>&#10005;</button>
            <span className="task-detail-title">{task.name}</span>
            <span className="task-detail-edit">&#9998;</span>
            <span className="task-detail-deadline-wrap">
              <span className="task-detail-deadline-label">Deadline:</span>
              <span className="task-detail-deadline-value">20 Mar 2026</span>
            </span>
          </div>
          <div className="task-detail-actions">
            {task.approved ? (
              <>
                <button className="btn-reject">Reject</button>
                <button className="btn-approve" onClick={collectAndSubmit}>Approve</button>
              </>
            ) : (
              <>
                <label className="mark-done-label">
                  <input type="checkbox" checked={markDone} onChange={e => setMarkDone(e.target.checked)} />
                  Mark this task as done automatically?
                </label>
                <button className="btn-submit" onClick={() => {
                  if (onVendorTaskSubmit && isVendorSelectionTask) {
                    onVendorTaskSubmit(selectedVendors);
                  } else {
                    collectAndSubmit();
                  }
                }}>Submit</button>
              </>
            )}
          </div>
        </div>
      )}

      {submitted && (
        <div style={{
          margin: '12px 16px 0', padding: '8px 14px',
          background: '#D3FFEA', color: '#0F6E3C',
          borderRadius: 6, fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          &#10003; Submitted
        </div>
      )}

      {hideHeader && !submitted && (
        <div style={{ padding: '12px 16px 0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {task.approved ? (
            <>
              <button className="btn-reject">Reject</button>
              <button className="btn-approve" onClick={collectAndSubmit}>Approve</button>
            </>
          ) : (
            <>
              <label className="mark-done-label">
                <input type="checkbox" checked={markDone} onChange={e => setMarkDone(e.target.checked)} />
                Mark this task as done automatically?
              </label>
              <button className="btn-submit" onClick={() => {
                if (onVendorTaskSubmit && isVendorSelectionTask) {
                  onVendorTaskSubmit(selectedVendors);
                } else {
                  collectAndSubmit();
                }
              }}>Submit</button>
            </>
          )}
        </div>
      )}

      <div className="task-detail-body">
        {!hasF ? (
          <div className="system-task-placeholder">
            System task ({task.code}) &mdash; fields rendered by platform
          </div>
        ) : (
          <>
            {allF.length > 0 && (() => {
              // Check if this is a container-row task
              const containerFields = allF.filter(f => f.note === 'container-row');
              const nonContainerFields = allF.filter(f => f.note !== 'container-row');

              if (containerFields.length > 0) {
                return (
                  <div style={{ padding: '0 4px' }}>
                    {nonContainerFields.length > 0 && (
                      <div className="fields-grid">
                        {nonContainerFields.map((f, i) => (
                          <div key={i} className="field-item">
                            <div className="field-label">
                              {f.label}
                              {f.req && <span className="field-required">*</span>}
                            </div>
                            <FieldInput f={f} value={fieldValues[f.label]} onChange={v => updateField(f.label, v)} />
                          </div>
                        ))}
                      </div>
                    )}
                    <ContainerRowRepeater fields={containerFields} fieldValues={fieldValues} onFieldChange={updateField} />
                  </div>
                );
              }

              return (
              <div className="fields-grid">
                {allF.map((f, i) => {
                  if (!shouldShowField(f)) return null;

                  // Special rendering for Vendor Selection addmore field
                  if (isVendorSelectionTask && f.type === 'addmore') {
                    const filteredField = { ...f, opts: getVendorOptions(f.opts || [], incoterm) };
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
                        <VendorAddMoreField f={filteredField} onSelectionChange={handleVendorChange} initialValues={selectedVendors.length > 0 ? selectedVendors : undefined} />
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
                      <FieldInput f={f} value={fieldValues[f.label]} onChange={v => updateField(f.label, v)} />
                    </div>
                  );
                })}
              </div>
              );
            })()}

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
                        <FieldInput f={f} value={fieldValues[f.label]} onChange={v => updateField(f.label, v)} />
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
