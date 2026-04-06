import React, { useState } from 'react';

interface Props {
  persona: string;
  vendorNames: string[]; // dynamic list from confirmation task
  children: (vendorIndex: number, vendorName: string) => React.ReactNode;
  submittedIndices?: Set<number>;
}

// Personas that support multi-vendor tabs
export const MULTI_VENDOR_PERSONAS = ['Transporter', 'CFS', 'ICD', 'Surveyor'];

export function isMultiVendorPersona(persona: string): boolean {
  return MULTI_VENDOR_PERSONAS.includes(persona);
}

// Default vendor names if none selected yet
export function getDefaultVendorNames(persona: string): string[] {
  return [`${persona} 1`, `${persona} 2`, `${persona} 3`];
}

// Map confirmation task names to persona types
export const CONFIRMATION_TASK_MAP: Record<string, string> = {
  'Confirm CFS Vendor': 'CFS',
  'Confirm ICD Vendor': 'ICD',
  'Transporter Confirmation': 'Transporter',
};

// Field label used in each confirmation task's addmore
export const CONFIRMATION_FIELD_MAP: Record<string, string> = {
  'Confirm CFS Vendor': 'CFS Vendors',
  'Confirm ICD Vendor': 'ICD Vendors',
  'Transporter Confirmation': 'Transporter',
};

const MultiVendorWrapper: React.FC<Props> = ({ persona, vendorNames, children, submittedIndices }) => {
  const [activeVendorIdx, setActiveVendorIdx] = useState(0);
  const vendors = vendorNames.length > 0 ? vendorNames : getDefaultVendorNames(persona);

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
