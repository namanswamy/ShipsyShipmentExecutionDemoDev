import React from 'react';

const milestoneTabs = [
  { key: 'ALL', label: 'All', count: '999+' },
  { key: 'DRAFT', label: 'Drafts', count: '999+' },
  { key: 'AT_ORIGIN', label: 'Origin', count: '61' },
  { key: 'IN_TRANSIT', label: 'In Transit', count: '3' },
  { key: 'TRANSSHIPMENT', label: 'Transhipment', count: '0' },
  { key: 'DESTINATION', label: 'Destination', count: '1' },
  { key: 'COMPLETED', label: 'Completed', count: '14' },
  { key: 'ON_HOLD', label: 'On Hold', count: '2' },
  { key: 'DELETED', label: 'Deleted', count: '308' },
];

interface Props {
  active: string;
  onChange: (key: string) => void;
}

const MilestoneBar: React.FC<Props> = ({ active, onChange }) => {
  return (
    <div className="milestone-status-bar">
      <div className="milestone-tabs">
        {milestoneTabs.map(tab => (
          <button
            key={tab.key}
            className={`ms-tab ${active === tab.key ? 'active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
            <span className="ms-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>
      <div className="milestone-right">
        <button className="btn-bulk-update">Bulk Update</button>
        <div className="pagination-bar">
          <button title="First">&#x276E;&#x276E;</button>
          <button title="Previous">&#x276E;</button>
          <span style={{ fontWeight: 600, color: '#333' }}>1</span>
          <button title="Next">&#x276F;</button>
          <button title="Last">&#x276F;&#x276F;</button>
          <select defaultValue="10">
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MilestoneBar;
