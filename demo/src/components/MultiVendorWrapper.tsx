import React, { useState } from 'react';

// Demo vendor names per persona type
const VENDOR_NAMES: Record<string, string[]> = {
  'Transporter': ['Transporter - 1', 'Transporter - 2', 'Transporter - 3'],
  'CFS': ['CFS - 1', 'CFS - 2', 'CFS - 3'],
  'ICD': ['ICD - 1', 'ICD - 2', 'ICD - 3'],
  'Surveyor': ['Surveyor - 1', 'Surveyor - 2', 'Surveyor - 3'],
};

interface Props {
  persona: string; // 'Transporter' | 'CFS' | 'ICD'
  children: (vendorIndex: number, vendorName: string) => React.ReactNode;
  submittedIndices?: Set<number>;
}

// Personas that support multi-vendor tabs
export const MULTI_VENDOR_PERSONAS = ['Transporter', 'CFS', 'ICD', 'Surveyor'];

export function isMultiVendorPersona(persona: string): boolean {
  return MULTI_VENDOR_PERSONAS.includes(persona);
}

export function getVendorNames(persona: string): string[] {
  return VENDOR_NAMES[persona] || [`${persona} 1`, `${persona} 2`, `${persona} 3`];
}

const MultiVendorWrapper: React.FC<Props> = ({ persona, children, submittedIndices }) => {
  const vendors = getVendorNames(persona);
  const [activeVendorIdx, setActiveVendorIdx] = useState(0);

  return (
    <div>
      {/* Vendor tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid #e8e8e8', background: '#FAFAFA',
      }}>
        {vendors.map((name, idx) => {
          const isSubmitted = submittedIndices?.has(idx) ?? false;
          return (
            <button
              key={idx}
              onClick={() => setActiveVendorIdx(idx)}
              style={{
                padding: '8px 14px', fontSize: 12, fontFamily: 'inherit',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeVendorIdx === idx ? '3px solid #006EC3' : '3px solid transparent',
                color: activeVendorIdx === idx ? '#006EC3' : '#666',
                fontWeight: activeVendorIdx === idx ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: isSubmitted ? '#0F6E3C' : activeVendorIdx === idx ? '#006EC3' : '#ddd',
                color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{isSubmitted ? '✓' : idx + 1}</span>
              {name}
              {isSubmitted && (
                <span style={{
                  fontSize: 10, color: '#0F6E3C', fontWeight: 700,
                  background: '#D3FFEA', borderRadius: 3, padding: '1px 5px',
                }}>Submitted</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active vendor content */}
      {children(activeVendorIdx, vendors[activeVendorIdx])}
    </div>
  );
};

export default MultiVendorWrapper;
