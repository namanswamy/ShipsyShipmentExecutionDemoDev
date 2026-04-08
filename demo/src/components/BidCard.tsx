import React from 'react';
import type { Bid } from '../data/bidData';
import { formatAmount } from '../data/bidData';

const podOnlyVendors = ['CHA', 'CFS', 'ICD', 'Transporter', 'Surveyor'];

interface Props {
  bid: Bid;
  selected: boolean;
  onClick?: () => void;
  readOnly?: boolean;
  dimmed?: boolean;
  onViewDetails?: () => void;
  isSpot?: boolean;
}

const BidCard: React.FC<Props> = ({ bid, selected, onClick, readOnly, dimmed, onViewDetails, isSpot }) => {
  const rankColors: Record<number, { bg: string; c: string }> = {
    1: { bg: '#E8F5E9', c: '#2E7D32' },
    2: { bg: '#FFF3E0', c: '#E65100' },
    3: { bg: '#FFEBEE', c: '#C62828' },
  };
  const rankStyle = rankColors[bid.rank] || rankColors[3];
  const showPol = !podOnlyVendors.includes(bid.vendorType) && bid.pol;

  // Color scheme based on Spot/Normal and readOnly (L1 Deviation)
  const isL1 = readOnly;
  let cardBg: string;
  let cardBorder: string;
  let bottomBarBg: string;
  let amountBg: string;

  if (isSpot) {
    // Spot: warm orange tones
    cardBg = isL1 ? '#FFF9F2' : '#FFF5EB';
    cardBorder = selected ? '2px solid #E65100' : (isL1 ? '1px solid #FFCC80' : '1px solid #FFB74D');
    bottomBarBg = isL1 ? '#FFF5EB' : '#FFF3E0';
    amountBg = isL1 ? '#FFF0E0' : '#FFE0B2';
  } else {
    // Normal: grey tones
    cardBg = isL1 ? '#FBFBFB' : '#F8F8F8';
    cardBorder = selected ? '2px solid #006EC3' : (isL1 ? '1px solid #E0E0E0' : '1px solid #D0D0D0');
    bottomBarBg = isL1 ? '#F5F5F5' : '#F0F0F0';
    amountBg = isL1 ? '#F0F0F0' : '#EEEEEE';
  }

  return (
    <div
      onClick={!readOnly ? onClick : undefined}
      style={{
        border: cardBorder,
        borderRadius: 6,
        cursor: readOnly ? 'default' : 'pointer',
        opacity: dimmed ? 0.45 : 1,
        marginBottom: 10,
        background: cardBg,
        transition: 'border-color .15s, opacity .15s, background .15s',
        overflow: 'hidden',
      }}
    >
      {/* Main card body */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 0,
        flexWrap: 'wrap',
      }}>
        {/* Shipsy branding */}
        <div style={{
          minWidth: 110, display: 'flex', alignItems: 'center', gap: 6,
          paddingRight: 16, borderRight: '1px solid #eee',
        }}>
          <img src="/shipsy-logo.jpg" alt="Shipsy" style={{ height: 28, objectFit: 'contain' }} />
        </div>

        {/* POL (if applicable) */}
        {showPol && (
          <div style={{ minWidth: 90, padding: '0 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{bid.pol}</div>
            <div style={{ fontSize: 10, color: '#999' }}>POL</div>
          </div>
        )}

        {/* POD */}
        <div style={{ minWidth: 90, padding: '0 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{bid.pod}</div>
          <div style={{ fontSize: 10, color: '#999' }}>POD</div>
        </div>

        {/* Starting Date */}
        <div style={{ minWidth: 100, padding: '0 12px' }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#333' }}>{bid.startDate}</div>
          <div style={{ fontSize: 10, color: '#999' }}>Starting Date</div>
        </div>

        {/* End Date */}
        <div style={{ minWidth: 100, padding: '0 12px' }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#333' }}>{bid.endDate}</div>
          <div style={{ fontSize: 10, color: '#999' }}>End Date</div>
        </div>

        {/* Amount */}
        <div style={{
          marginLeft: 'auto', background: amountBg, borderRadius: 4,
          padding: '8px 16px', textAlign: 'right', minWidth: 130,
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>
            {formatAmount(bid.amount, bid.currency)}
          </div>
          <div style={{ fontSize: 10, color: '#999' }}>Total Freight</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '5px 20px',
        background: bottomBarBg, borderTop: isSpot ? '1px solid #FFE0B2' : '1px solid #E8E8E8', fontSize: 11,
        color: '#666', overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <span style={{
          background: rankStyle.bg, color: rankStyle.c,
          padding: '2px 8px', borderRadius: 3, fontWeight: 600, fontSize: 11, flexShrink: 0,
        }}>
          Rank {bid.rank}
        </span>
        <span style={{ flexShrink: 0 }}>{bid.vendorType} : {bid.vendorName}</span>
        {bid.carrierName !== '-' && <span style={{ flexShrink: 0 }}>Carrier : {bid.carrierName}</span>}
        {bid.containerSize !== '-' && <span style={{ flexShrink: 0 }}>Container Size : {bid.containerSize}</span>}
        {bid.containerType !== '-' && <span style={{ flexShrink: 0 }}>Container Type : {bid.containerType}</span>}
        {bid.transitDays > 0 && <span style={{ flexShrink: 0 }}>Transit Days {bid.transitDays}</span>}
        <span
          onClick={e => { e.stopPropagation(); onViewDetails?.(); }}
          style={{ color: '#006EC3', cursor: 'pointer', fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}
        >
          View Details
        </span>
      </div>

      {/* Selection indicator */}
      {selected && !readOnly && (
        <div style={{
          background: isSpot ? '#E65100' : '#006EC3', color: '#fff', textAlign: 'center',
          padding: '3px 0', fontSize: 11, fontWeight: 600,
        }}>
          &#10003; Selected
        </div>
      )}
      {selected && readOnly && (
        <div style={{
          background: isSpot ? '#FFF3E0' : '#E3F2FD',
          color: isSpot ? '#E65100' : '#1565C0',
          textAlign: 'center', padding: '3px 0', fontSize: 11, fontWeight: 600,
          borderTop: isSpot ? '1px solid #FFE0B2' : '1px solid #BBDEFB',
        }}>
          &#10003; Selected
        </div>
      )}
    </div>
  );
};

export default BidCard;
