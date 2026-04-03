import React, { useState } from 'react';

const modes = [
  { key: 'FCL', label: 'FCL' },
  { key: 'LCL', label: 'LCL' },
  { key: 'AIR', label: 'Air' },
  { key: 'DOMESTIC', label: 'Domestic' },
  { key: 'RPTL', label: 'RPTL' },
];

const types = [
  { key: 'EXPORT', label: 'Export' },
  { key: 'IMPORT', label: 'Import' },
  { key: 'TRADE', label: 'Trade' },
];

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ModeIcon: React.FC<{ mode: string; active: boolean }> = ({ mode, active }) => {
  const color = active ? '#fff' : '#333';
  if (mode === 'FCL') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="18"/>
    </svg>
  );
  if (mode === 'LCL' || mode === 'RPTL') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="7" width="18" height="12" rx="1"/><polyline points="3 7 12 2 21 7"/>
    </svg>
  );
  if (mode === 'AIR') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>
    </svg>
  );
  if (mode === 'DOMESTIC') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="1" y="10" width="16" height="7" rx="1"/><circle cx="5" cy="19" r="2"/><circle cx="13" cy="19" r="2"/><path d="M17 10l4 4v3h-4"/>
    </svg>
  );
  return null;
};

const Filters: React.FC = () => {
  const [activeModes, setActiveModes] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeCompanyCodes, setActiveCompanyCodes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('');
  const [myTask, setMyTask] = useState('');

  const toggleMode = (key: string) =>
    setActiveModes(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  const toggleType = (key: string) =>
    setActiveTypes(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]);
  const toggleCompany = (key: string) =>
    setActiveCompanyCodes(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);

  const hasFilters = activeModes.length > 0 || activeTypes.length > 0 || activeCompanyCodes.length > 0 || sortBy || myTask;

  const resetAll = () => {
    setActiveModes([]);
    setActiveTypes([]);
    setActiveCompanyCodes([]);
    setSortBy('');
    setMyTask('');
  };

  return (
    <div className="filter-bar">
      {/* Left: filters */}
      <span className="filter-label" style={{ marginLeft: 0 }}>Mode</span>
      {modes.map(m => (
        <button
          key={m.key}
          className={`filter-btn ${activeModes.includes(m.key) ? 'active' : ''}`}
          onClick={() => toggleMode(m.key)}
        >
          <ModeIcon mode={m.key} active={activeModes.includes(m.key)} />
          <span>{m.label}</span>
        </button>
      ))}

      <span className="filter-label">Type</span>
      {types.map(t => (
        <button
          key={t.key}
          className={`filter-btn ${activeTypes.includes(t.key) ? 'active' : ''}`}
          onClick={() => toggleType(t.key)}
        >
          {t.label}
        </button>
      ))}

      <span className="filter-label">My Task</span>
      <div className="filter-select-wrapper">
        <select
          className="filter-select"
          value={myTask}
          onChange={e => setMyTask(e.target.value)}
        >
          <option value="">Select</option>
          <option value="DEADLINE_ELAPSED">Deadline Elapsed</option>
          <option value="DEADLINE_APPROACHING">Deadline Approaching</option>
          <option value="PENDING">Pending</option>
        </select>
        <span className="filter-select-arrow">&#9662;</span>
      </div>

      <span className="filter-label">Company Code</span>
      {['101', 'sbu', 'RJL', 'RPP'].map(c => (
        <button
          key={c}
          className={`filter-btn ${activeCompanyCodes.includes(c) ? 'active' : ''}`}
          onClick={() => toggleCompany(c)}
        >
          {c}
        </button>
      ))}

      <span className="filter-label">Sort By</span>
      <div className="filter-select-wrapper">
        <select
          className="filter-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="">Updated At</option>
          <option value="nearest_deadline">Nearest Deadline</option>
          <option value="updated_at">Last Activity Date</option>
          <option value="created_at">Recently Created</option>
        </select>
        <span className="filter-select-arrow">&#9662;</span>
      </div>

      <div className="filter-divider" />

      <div className="filter-more">
        <FilterIcon />
        <span>More Filters</span>
      </div>

      {hasFilters && (
        <span className="filter-reset" onClick={resetAll}>Reset Filter</span>
      )}

      {/* Right: refresh, search, reports, new shipment */}
      <div className="filter-bar-right">
        <button className="navbar-icon-btn" title="Refresh">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
        <button className="navbar-icon-btn" title="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button className="btn-reports">Reports</button>
        <button className="btn-new-shipment">New Shipment</button>
      </div>
    </div>
  );
};

export default Filters;
