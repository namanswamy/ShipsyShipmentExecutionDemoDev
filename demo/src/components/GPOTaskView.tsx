import React, { useState, useMemo } from 'react';
import type { Bid } from '../data/bidData';
import { getBidsForVendors, getSpotBidsForVendors, getNormalRank1Bids, formatAmount } from '../data/bidData';
import BidCard from './BidCard';

interface GPOResult {
  selectedBids: Record<string, string>;
  totalBidAmount: number;
  totalDeviation: number;
  deviationReason: string;
  deviationRemarks?: string;
  allBids: Bid[];
  isSpot?: boolean;
  normalRank1Bids?: Bid[];
}

interface Props {
  selectedVendors: string[];
  pol?: string;
  pod?: string;
  isSpot?: boolean;
  onClose: () => void;
  onSubmit: (result: GPOResult) => void;
  readOnly?: boolean;
  previousResult?: GPOResult | null;
  onReject?: (remarks: string) => void;
  rejectionRemarks?: string;
  reworkMode?: boolean; // true = show banner but read-only until status changed
}

// View Details Modal
const ViewDetailsModal: React.FC<{ bid: Bid; onClose: () => void }> = ({ bid, onClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', zIndex: 60,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    paddingTop: 40,
  }}>
    <div style={{
      background: '#fff', borderRadius: 8, width: 560, maxHeight: '80vh',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid #eee', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#333' }}>Detail View</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: '#666', cursor: 'pointer',
        }}>&#10005;</button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {Object.entries(bid.details).map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{
                  padding: '10px 20px', fontWeight: 600, color: '#333',
                  width: '40%', verticalAlign: 'top', background: '#FAFAFA',
                }}>{key}</td>
                <td style={{ padding: '10px 20px', color: '#555' }}>{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Tender Rank 1 Reference Card (non-editable, for Spot mode)
const podOnlyVendors = ['CHA', 'CFS', 'ICD', 'Transporter', 'Surveyor'];

const NormalRefCard: React.FC<{ bid: Bid; onViewDetails: () => void }> = ({ bid, onViewDetails }) => {
  const showPol = !podOnlyVendors.includes(bid.vendorType) && bid.pol;
  return (
    <div style={{
      border: '1px dashed #bbb', borderRadius: 6, marginBottom: 12,
      background: '#F9F9F9', opacity: 0.85, overflow: 'hidden',
    }}>
      <div style={{
        padding: '4px 20px', background: '#EDEDED', fontSize: 11, fontWeight: 600, color: '#666',
      }}>
        Tender RFQ Rank 1 Bid
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap',
      }}>
        <div style={{
          minWidth: 110, display: 'flex', alignItems: 'center', gap: 6,
          paddingRight: 16, borderRight: '1px solid #ddd',
        }}>
          <img src="/shipsy-logo.jpg" alt="Shipsy" style={{ height: 24, objectFit: 'contain', opacity: 0.6 }} />
        </div>
        {showPol && (
          <div style={{ minWidth: 90, padding: '0 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#666' }}>{bid.pol}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>POL</div>
          </div>
        )}
        <div style={{ minWidth: 90, padding: '0 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#666' }}>{bid.pod}</div>
          <div style={{ fontSize: 10, color: '#aaa' }}>POD</div>
        </div>
        <div style={{ minWidth: 100, padding: '0 12px' }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#666' }}>{bid.startDate}</div>
          <div style={{ fontSize: 10, color: '#aaa' }}>Starting Date</div>
        </div>
        <div style={{ minWidth: 100, padding: '0 12px' }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#666' }}>{bid.endDate}</div>
          <div style={{ fontSize: 10, color: '#aaa' }}>End Date</div>
        </div>
        <div style={{
          marginLeft: 'auto', background: '#F0F0F0', borderRadius: 4,
          padding: '8px 16px', textAlign: 'right', minWidth: 130,
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#666' }}>
            {formatAmount(bid.amount, bid.currency)}
          </div>
          <div style={{ fontSize: 10, color: '#aaa' }}>Total Freight</div>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '5px 20px',
        background: '#EDEDED', borderTop: '1px solid #ddd', fontSize: 11, color: '#888',
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 3, fontWeight: 600, flexShrink: 0 }}>
          Rank 1
        </span>
        <span style={{ flexShrink: 0 }}>{bid.vendorType} : {bid.vendorName}</span>
        {bid.carrierName !== '-' && <span style={{ flexShrink: 0 }}>Carrier : {bid.carrierName}</span>}
        {bid.containerSize !== '-' && <span style={{ flexShrink: 0 }}>Container Size : {bid.containerSize}</span>}
        {bid.containerType !== '-' && <span style={{ flexShrink: 0 }}>Container Type : {bid.containerType}</span>}
        {bid.transitDays > 0 && <span style={{ flexShrink: 0 }}>Transit Days {bid.transitDays}</span>}
        <span
          onClick={e => { e.stopPropagation(); onViewDetails(); }}
          style={{ color: '#006EC3', cursor: 'pointer', fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}
        >
          View Details
        </span>
      </div>
    </div>
  );
};

const GPOTaskView: React.FC<Props> = ({ selectedVendors, pol, pod, isSpot, onClose, onSubmit, readOnly, previousResult, onReject, rejectionRemarks, reworkMode }) => {
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  // Generate bids
  const allBids = useMemo(
    () => previousResult?.allBids || (isSpot
      ? getSpotBidsForVendors(selectedVendors, pol, pod)
      : getBidsForVendors(selectedVendors, pol, pod)),
    [selectedVendors, previousResult, pol, pod, isSpot]
  );

  const normalRank1Bids = useMemo(
    () => previousResult?.normalRank1Bids || (isSpot
      ? getNormalRank1Bids(selectedVendors, pol, pod)
      : []),
    [selectedVendors, previousResult, pol, pod, isSpot]
  );

  const [selectedBids, setSelectedBids] = useState<Record<string, string>>(
    previousResult?.selectedBids || {}
  );
  const [showDeviationPopup, setShowDeviationPopup] = useState(false);
  const [deviationReason, setDeviationReason] = useState(previousResult?.deviationReason || '');
  const [deviationRemarks, setDeviationRemarks] = useState(previousResult?.deviationRemarks || '');
  const [viewDetailBid, setViewDetailBid] = useState<Bid | null>(null);

  // Group bids by vendor type
  const groupedBids = useMemo(() => {
    const groups: Record<string, Bid[]> = {};
    for (const bid of allBids) {
      if (!groups[bid.vendorType]) groups[bid.vendorType] = [];
      groups[bid.vendorType].push(bid);
    }
    return groups;
  }, [allBids]);

  // Group normal rank 1 by vendor type (for spot reference)
  const normalRank1ByVendor = useMemo(() => {
    const map: Record<string, Bid> = {};
    for (const bid of normalRank1Bids) {
      map[bid.vendorType] = bid;
    }
    return map;
  }, [normalRank1Bids]);

  const vendorTypes = Object.keys(groupedBids);
  const [activeVendorTab, setActiveVendorTab] = useState(vendorTypes[0] || '');

  // Calculate totals
  const { totalBidAmount, totalDeviation } = useMemo(() => {
    let total = 0;
    let deviation = 0;
    for (const [vendorType, bidId] of Object.entries(selectedBids)) {
      const vendorBids = groupedBids[vendorType];
      if (!vendorBids) continue;
      const selectedBid = vendorBids.find(b => b.id === bidId);
      if (selectedBid) {
        total += selectedBid.amount;
        if (isSpot) {
          // Spot deviation: selected spot bid - normal rank 1 bid
          const normalRef = normalRank1ByVendor[vendorType];
          if (normalRef) {
            deviation += selectedBid.amount - normalRef.amount;
          }
        } else {
          // Tender deviation: selected bid - rank 1 bid
          const rank1Bid = vendorBids.find(b => b.rank === 1);
          if (rank1Bid && selectedBid.rank > 1) {
            deviation += selectedBid.amount - rank1Bid.amount;
          }
        }
      }
    }
    return { totalBidAmount: total, totalDeviation: deviation };
  }, [selectedBids, groupedBids, isSpot, normalRank1ByVendor]);

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
    // Spot always has deviation; Tender only if deviation > 0
    if ((isSpot || totalDeviation > 0) && !deviationReason) {
      setShowDeviationPopup(true);
      return;
    }
    onSubmit({ selectedBids, totalBidAmount, totalDeviation, deviationReason, deviationRemarks, allBids, isSpot, normalRank1Bids });
  };

  const handleDeviationSubmit = () => {
    if (!deviationReason) return;
    setShowDeviationPopup(false);
    onSubmit({ selectedBids, totalBidAmount, totalDeviation, deviationReason, deviationRemarks, allBids, isSpot, normalRank1Bids });
  };

  const allVendorsSelected = vendorTypes.every(vt => selectedBids[vt]);
  const activeBids = groupedBids[activeVendorTab] || [];
  const activeNormalRef = normalRank1ByVendor[activeVendorTab];

  return (
    <div className="task-detail">
      {/* Header */}
      <div className="task-detail-header">
        <div className="task-detail-header-left">
          <button className="task-detail-close" onClick={onClose}>&#10005;</button>
          <span className="task-detail-title">
            {readOnly ? 'Approval of L1 Deviation' : 'Run Global Plan Optimizer'}
          </span>
          {isSpot && (
            <span style={{ fontSize: 11, background: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: 3, fontWeight: 600 }}>
              SPOT
            </span>
          )}
          <span className="task-detail-deadline-wrap">
            <span className="task-detail-deadline-label">Deadline:</span>
            <span className="task-detail-deadline-value">06 Mar 2026</span>
          </span>
        </div>
        <div className="task-detail-actions">
          {readOnly ? (
            <>
              <button className="btn-reject" onClick={() => onReject ? setShowRejectPopup(true) : onClose()}>Reject</button>
              <button className="btn-approve" onClick={() => onSubmit({
                selectedBids, totalBidAmount, totalDeviation, deviationReason, deviationRemarks, allBids, isSpot, normalRank1Bids,
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

      {/* Vendor type tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid #e8e8e8', background: '#FAFAFA',
      }}>
        {vendorTypes.map(vt => (
          <button
            key={vt}
            onClick={() => setActiveVendorTab(vt)}
            style={{
              padding: '10px 16px', fontSize: 13, fontFamily: 'inherit',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeVendorTab === vt ? '3px solid #006EC3' : '3px solid transparent',
              color: activeVendorTab === vt ? '#006EC3' : '#666',
              fontWeight: activeVendorTab === vt ? 700 : 400,
            }}
          >
            {vt}
            {selectedBids[vt] && <span style={{ color: '#43A047', marginLeft: 6, fontSize: 12 }}>&#10003;</span>}
          </button>
        ))}
      </div>

      {/* Body */}
      {/* Rejection remarks banner */}
      {rejectionRemarks && (
        <div style={{
          margin: '0 16px', padding: '10px 16px', background: '#FFF3E0', border: '1px solid #FFCC80',
          borderRadius: 6, display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 16, lineHeight: '1' }}>&#9888;</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#E65100', marginBottom: 2 }}>L1 Deviation Rejected</div>
            <div style={{ fontSize: 11, color: '#333' }}>Remarks: {rejectionRemarks}</div>
            {reworkMode && <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>Change status to "In Progress" to re-select bids.</div>}
          </div>
        </div>
      )}

      <div className="task-detail-body" style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 12 }}>
          {isSpot ? 'Spot Bid Details' : 'Bid Details'} — {activeVendorTab}
          {!selectedBids[activeVendorTab] && !readOnly && (
            <span style={{ fontWeight: 400, color: '#999', marginLeft: 8, fontSize: 11 }}>
              (Select one bid)
            </span>
          )}
        </div>

        {/* Tender Rank 1 reference card (Spot mode only) */}
        {isSpot && activeNormalRef && (
          <NormalRefCard bid={activeNormalRef} onViewDetails={() => setViewDetailBid(activeNormalRef)} />
        )}

        {/* Bid cards for active vendor tab */}
        {activeBids.map(bid => (
          <BidCard
            key={bid.id}
            bid={bid}
            selected={selectedBids[activeVendorTab] === bid.id}
            onClick={() => handleSelectBid(activeVendorTab, bid.id)}
            readOnly={readOnly}
            dimmed={readOnly && selectedBids[activeVendorTab] !== bid.id}
            onViewDetails={() => setViewDetailBid(bid)}
            isSpot={isSpot}
          />
        ))}

        {/* Totals section */}
        <div style={{
          borderTop: '2px solid #e0e0e0', paddingTop: 16, marginTop: 20,
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
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              {isSpot ? 'Spot Deviation from Tender' : 'Total Deviation Amount'}
            </div>
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
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Deviation Reason</div>
            <div style={{
              background: '#FFF8E1', borderRadius: 4, padding: '10px 16px',
              fontSize: 13, fontWeight: 500, color: '#333', border: '1px solid #FFE082',
            }}>
              {deviationReason}
              {deviationRemarks && <div style={{ fontSize: 12, color: '#666', marginTop: 6, fontWeight: 400, fontStyle: 'italic' }}>{deviationRemarks}</div>}
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewDetailBid && (
        <ViewDetailsModal bid={viewDetailBid} onClose={() => setViewDetailBid(null)} />
      )}

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
              {isSpot ? 'Spot Rate Deviation' : 'Deviation Detected'}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
              {isSpot
                ? <>Spot rate deviates from Tender RFQ Rank 1. Deviation: <b style={{ color: '#E65100' }}>{formatAmount(totalDeviation, 'USD')}</b></>
                : <>A bid other than Rank 1 was selected. Total deviation: <b style={{ color: '#E65100' }}>{formatAmount(totalDeviation, 'USD')}</b></>
              }
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
              Deviation Reason <span style={{ color: '#E53935' }}>*</span>
            </div>
            <select
              className="field-input"
              value={deviationReason}
              onChange={e => setDeviationReason(e.target.value)}
              style={{ marginBottom: 20, height: 36, padding: '0 10px' }}
            >
              <option value="">Select category...</option>
              <option value="Capacity Constraint">Capacity Constraint</option>
              <option value="Service Level Requirement">Service Level Requirement</option>
              <option value="Vendor Non-Availability">Vendor Non-Availability</option>
              <option value="Urgent / Priority Shipment">Urgent / Priority Shipment</option>
              <option value="Rate Negotiation Pending">Rate Negotiation Pending</option>
              <option value="Operational Requirement">Operational Requirement</option>
              <option value="Customer / Consignee Request">Customer / Consignee Request</option>
              <option value="Contract Rate Expired">Contract Rate Expired</option>
              <option value="Route / Transit Preference">Route / Transit Preference</option>
              <option value="Other">Other</option>
            </select>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
              Additional Remarks
            </div>
            <textarea
              className="field-input"
              value={deviationRemarks}
              onChange={e => setDeviationRemarks(e.target.value)}
              placeholder="Enter additional details..."
              style={{ marginBottom: 20, height: 60, padding: '8px 10px', resize: 'vertical' }}
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
      {/* Reject remarks popup */}
      {showRejectPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, width: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 4 }}>Reject L1 Deviation</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Please provide a reason for rejecting the deviation.</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
              Reason for Rejection <span style={{ color: '#E53935' }}>*</span>
            </div>
            <textarea
              className="field-input"
              value={rejectRemark}
              onChange={e => setRejectRemark(e.target.value)}
              placeholder="Enter rejection remarks..."
              style={{ marginBottom: 20, height: 80, padding: '8px 10px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-reject" onClick={() => { setShowRejectPopup(false); setRejectRemark(''); }} style={{ border: '1px solid #999', color: '#333' }}>Cancel</button>
              <button
                className="btn-submit"
                onClick={() => { if (rejectRemark.trim()) { onReject?.(rejectRemark); setShowRejectPopup(false); setRejectRemark(''); } }}
                style={{ opacity: rejectRemark.trim() ? 1 : 0.5, background: '#E53935' }}
                disabled={!rejectRemark.trim()}
              >Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export type { GPOResult };
export default GPOTaskView;
