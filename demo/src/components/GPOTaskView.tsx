import React, { useState, useMemo } from 'react';
import type { Bid } from '../data/bidData';
import { getBidsForVendors, formatAmount } from '../data/bidData';
import BidCard from './BidCard';

interface GPOResult {
  selectedBids: Record<string, string>; // vendorType -> bidId
  totalBidAmount: number;
  totalDeviation: number;
  deviationReason: string;
  allBids: Bid[];
}

interface Props {
  selectedVendors: string[];
  onClose: () => void;
  onSubmit: (result: GPOResult) => void;
  readOnly?: boolean;
  previousResult?: GPOResult | null;
}

const DEVIATION_REASONS = [
  'Rate higher than L1',
  'Preferred carrier unavailable',
  'Schedule mismatch',
  'Equipment unavailability',
  'Port congestion',
  'Customer request',
  'Other',
];

const GPOTaskView: React.FC<Props> = ({ selectedVendors, onClose, onSubmit, readOnly, previousResult }) => {
  const allBids = useMemo(() => previousResult?.allBids || getBidsForVendors(selectedVendors), [selectedVendors, previousResult]);

  const [selectedBids, setSelectedBids] = useState<Record<string, string>>(
    previousResult?.selectedBids || {}
  );
  const [showDeviationPopup, setShowDeviationPopup] = useState(false);
  const [deviationReason, setDeviationReason] = useState(previousResult?.deviationReason || '');

  // Group bids by vendor type
  const groupedBids = useMemo(() => {
    const groups: Record<string, Bid[]> = {};
    for (const bid of allBids) {
      if (!groups[bid.vendorType]) groups[bid.vendorType] = [];
      groups[bid.vendorType].push(bid);
    }
    return groups;
  }, [allBids]);

  // Calculate totals
  const { totalBidAmount, totalDeviation } = useMemo(() => {
    let total = 0;
    let deviation = 0;

    for (const [vendorType, bidId] of Object.entries(selectedBids)) {
      const vendorBids = groupedBids[vendorType];
      if (!vendorBids) continue;

      const selectedBid = vendorBids.find(b => b.id === bidId);
      const rank1Bid = vendorBids.find(b => b.rank === 1);

      if (selectedBid) {
        total += selectedBid.amount;
        if (rank1Bid && selectedBid.rank > 1) {
          deviation += selectedBid.amount - rank1Bid.amount;
        }
      }
    }

    return { totalBidAmount: total, totalDeviation: deviation };
  }, [selectedBids, groupedBids]);

  const handleSelectBid = (vendorType: string, bidId: string) => {
    if (readOnly) return;
    setSelectedBids(prev => {
      if (prev[vendorType] === bidId) {
        const next = { ...prev };
        delete next[vendorType];
        return next;
      }
      return { ...prev, [vendorType]: bidId };
    });
  };

  const handleSubmit = () => {
    if (totalDeviation > 0 && !deviationReason) {
      setShowDeviationPopup(true);
      return;
    }
    onSubmit({
      selectedBids,
      totalBidAmount,
      totalDeviation,
      deviationReason,
      allBids,
    });
  };

  const handleDeviationSubmit = () => {
    if (!deviationReason) return;
    setShowDeviationPopup(false);
    onSubmit({
      selectedBids,
      totalBidAmount,
      totalDeviation,
      deviationReason,
      allBids,
    });
  };

  const allVendorsSelected = Object.keys(groupedBids).every(vt => selectedBids[vt]);

  return (
    <div className="task-detail">
      {/* Header */}
      <div className="task-detail-header">
        <div className="task-detail-header-left">
          <button className="task-detail-close" onClick={onClose}>&#10005;</button>
          <span className="task-detail-title">
            {readOnly ? 'Approval of L1 Deviation' : 'Run Global Plan Optimizer (SL/FF/AL Selection)'}
          </span>
          <span className="task-detail-deadline-wrap">
            <span className="task-detail-deadline-label">Deadline:</span>
            <span className="task-detail-deadline-value">06 Mar 2026</span>
          </span>
        </div>
        <div className="task-detail-actions">
          {readOnly ? (
            <>
              <button className="btn-reject" onClick={onClose}>Reject</button>
              <button className="btn-approve" onClick={() => onSubmit({
                selectedBids, totalBidAmount, totalDeviation, deviationReason, allBids,
              })}>Approve</button>
            </>
          ) : (
            <button
              className="btn-submit"
              onClick={handleSubmit}
              style={{ opacity: allVendorsSelected ? 1 : 0.5 }}
              disabled={!allVendorsSelected}
            >
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="task-detail-body" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 16 }}>Bid Details</div>

        {Object.entries(groupedBids).map(([vendorType, bids]) => (
          <div key={vendorType} style={{ marginBottom: 24 }}>
            {/* Vendor type header with container badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                background: '#E3F2FD', color: '#006EC3', padding: '4px 12px',
                borderRadius: 4, fontWeight: 600, fontSize: 13, border: '1px solid #BBDEFB',
              }}>
                {vendorType}
              </span>
              {selectedBids[vendorType] && (
                <span style={{ fontSize: 11, color: '#43A047', fontWeight: 600 }}>
                  &#10003; Bid selected
                </span>
              )}
            </div>

            {/* Bid cards */}
            {bids.map(bid => (
              <BidCard
                key={bid.id}
                bid={bid}
                selected={selectedBids[vendorType] === bid.id}
                onClick={() => handleSelectBid(vendorType, bid.id)}
                readOnly={readOnly}
                dimmed={readOnly && selectedBids[vendorType] !== bid.id}
              />
            ))}
          </div>
        ))}

        {/* Totals section */}
        <div style={{
          borderTop: '2px solid #e0e0e0', paddingTop: 16, marginTop: 16,
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Bid Amount</div>
            <div style={{
              background: '#F5F5F5', borderRadius: 4, padding: '10px 16px',
              fontSize: 18, fontWeight: 700, color: '#333',
            }}>
              {totalBidAmount > 0 ? formatAmount(totalBidAmount, 'USD') : '—'}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Deviation Amount</div>
            <div style={{
              background: totalDeviation > 0 ? '#FFF3E0' : '#F5F5F5', borderRadius: 4,
              padding: '10px 16px', fontSize: 18, fontWeight: 700,
              color: totalDeviation > 0 ? '#E65100' : '#333',
            }}>
              {totalDeviation > 0 ? formatAmount(totalDeviation, 'USD') : '0.00'}
            </div>
          </div>
        </div>

        {/* Deviation reason (read-only view) */}
        {readOnly && deviationReason && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Reason for Deviation</div>
            <div style={{
              background: '#FFF8E1', borderRadius: 4, padding: '10px 16px',
              fontSize: 13, fontWeight: 500, color: '#333', border: '1px solid #FFE082',
            }}>
              {deviationReason}
            </div>
          </div>
        )}
      </div>

      {/* Deviation popup */}
      {showDeviationPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, width: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 4 }}>
              Deviation Detected
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
              A bid other than Rank 1 was selected. Total deviation: <b style={{ color: '#E65100' }}>{formatAmount(totalDeviation, 'USD')}</b>
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
              Reason for Deviation <span style={{ color: '#E53935' }}>*</span>
            </div>
            <textarea
              className="field-input"
              value={deviationReason}
              onChange={e => setDeviationReason(e.target.value)}
              placeholder="Enter reason for deviation..."
              style={{ marginBottom: 20, height: 80, padding: '8px 10px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-reject" onClick={() => setShowDeviationPopup(false)} style={{ border: '1px solid #999', color: '#333' }}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleDeviationSubmit}
                style={{ opacity: deviationReason ? 1 : 0.5 }}
                disabled={!deviationReason}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export type { GPOResult };
export default GPOTaskView;
