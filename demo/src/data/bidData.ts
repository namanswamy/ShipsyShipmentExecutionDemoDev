export interface Bid {
  id: string;
  vendorType: string;
  rank: number;
  vendorName: string;
  carrierName: string;
  containerSize: string;
  containerType: string;
  transitDays: number;
  pol: string;
  pod: string;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  // Detail fields per vendor type
  details: Record<string, string>;
}

// Generate bids for a vendor type with consistent POL/POD/dates
function makeBids(
  vendorType: string,
  pol: string,
  pod: string,
  startDate: string,
  endDate: string,
  templates: Array<{
    rank: number; vendorName: string; carrierName: string;
    containerSize: string; containerType: string; transitDays: number;
    amount: number; details: Record<string, string>;
  }>
): Bid[] {
  return templates.map((t, i) => ({
    id: `${vendorType.replace(/\s/g, '').toLowerCase()}-${i + 1}`,
    vendorType,
    rank: t.rank,
    vendorName: t.vendorName,
    carrierName: t.carrierName,
    containerSize: t.containerSize,
    containerType: t.containerType,
    transitDays: t.transitDays,
    pol,
    pod,
    startDate,
    endDate,
    amount: t.amount,
    currency: 'USD',
    details: t.details,
  }));
}

const VENDOR_TEMPLATES: Record<string, (pol: string, pod: string, sd: string, ed: string) => Bid[]> = {
  'Freight Forwarder': (pol, pod, sd, ed) => makeBids('Freight Forwarder', pol, pod, sd, ed, [
    { rank: 1, vendorName: 'Eusu Logistics', carrierName: 'Maersk', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 18, amount: 1900,
      details: { 'Bid ID': '1528747-1520136', 'RFQ Plan': `FCL RFQ 2026-GLOBAL-A1-2026-OCEAN RFQ Q1 2026`, 'Freight Forwarder': 'Eusu Logistics', 'Destination Country': 'INDIA', 'Cargo Type': 'General', 'Product': 'General Dry Goods', 'Incoterm': 'FOB', 'Free Days (O)': '7', 'Free Days (D)': '14', 'Equipment Free Days (O)': '5', 'Equipment Free Days (D)': '7', 'CFS Free Days (D)': '3', 'Shipping Line': 'MAERSK LINE', 'Base Ocean Freight': 'USD 1500', 'HAZ Surcharge on Ocean Freight': 'USD 0', 'Bunker Cost': 'USD 400', 'Total Freight': 'USD 1900' } },
    { rank: 2, vendorName: 'Phoenix Global', carrierName: 'MSC', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 22, amount: 2150,
      details: { 'Bid ID': '1528747-1520137', 'RFQ Plan': `FCL RFQ 2026-GLOBAL-A1-2026-OCEAN RFQ Q1 2026`, 'Freight Forwarder': 'Phoenix Global', 'Destination Country': 'INDIA', 'Cargo Type': 'General', 'Product': 'General Dry Goods', 'Incoterm': 'FOB', 'Free Days (O)': '5', 'Free Days (D)': '10', 'Equipment Free Days (O)': '3', 'Equipment Free Days (D)': '5', 'CFS Free Days (D)': '3', 'Shipping Line': 'MSC', 'Base Ocean Freight': 'USD 1700', 'HAZ Surcharge on Ocean Freight': 'USD 0', 'Bunker Cost': 'USD 450', 'Total Freight': 'USD 2150' } },
    { rank: 3, vendorName: 'Kuehne+Nagel', carrierName: 'COSCO', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 20, amount: 2400,
      details: { 'Bid ID': '1528747-1520138', 'RFQ Plan': `FCL RFQ 2026-GLOBAL-A1-2026-OCEAN RFQ Q1 2026`, 'Freight Forwarder': 'Kuehne+Nagel', 'Destination Country': 'INDIA', 'Cargo Type': 'General', 'Product': 'General Dry Goods', 'Incoterm': 'FOB', 'Free Days (O)': '3', 'Free Days (D)': '7', 'Equipment Free Days (O)': '3', 'Equipment Free Days (D)': '5', 'CFS Free Days (D)': '2', 'Shipping Line': 'COSCO SHIPPING', 'Base Ocean Freight': 'USD 1900', 'HAZ Surcharge on Ocean Freight': 'USD 0', 'Bunker Cost': 'USD 500', 'Total Freight': 'USD 2400' } },
  ]),

  'Shipping Line': (pol, pod, sd, ed) => makeBids('Shipping Line', pol, pod, sd, ed, [
    { rank: 1, vendorName: 'Direct - Maersk', carrierName: 'Maersk', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 16, amount: 1750,
      details: { 'Bid ID': '1528750-1520200', 'RFQ Plan': 'FCL RFQ 2026-DIRECT-SL-Q1 2026', 'Shipping Line': 'MAERSK LINE', 'Destination Country': 'INDIA', 'Cargo Type': 'General', 'Product': 'General Dry Goods', 'Incoterm': 'FOB', 'Free Days (O)': '7', 'Free Days (D)': '14', 'Equipment Free Days (O)': '5', 'Equipment Free Days (D)': '10', 'Base Ocean Freight': 'USD 1350', 'HAZ Surcharge on Ocean Freight': 'USD 0', 'Bunker Cost': 'USD 400', 'Total Freight': 'USD 1750' } },
    { rank: 2, vendorName: 'Direct - Hapag-Lloyd', carrierName: 'Hapag-Lloyd', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 19, amount: 1950,
      details: { 'Bid ID': '1528750-1520201', 'RFQ Plan': 'FCL RFQ 2026-DIRECT-SL-Q1 2026', 'Shipping Line': 'HAPAG-LLOYD', 'Destination Country': 'INDIA', 'Cargo Type': 'General', 'Product': 'General Dry Goods', 'Incoterm': 'FOB', 'Free Days (O)': '5', 'Free Days (D)': '10', 'Equipment Free Days (O)': '3', 'Equipment Free Days (D)': '7', 'Base Ocean Freight': 'USD 1500', 'HAZ Surcharge on Ocean Freight': 'USD 0', 'Bunker Cost': 'USD 450', 'Total Freight': 'USD 1950' } },
  ]),

  'CHA': (_pol, pod, sd, ed) => makeBids('CHA', '', pod, sd, ed, [
    { rank: 1, vendorName: 'JM Baxi & Co', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 320,
      details: { 'Bid ID': '1528760-CHA001', 'CHA Name': 'JM Baxi & Co', 'Destination Country': 'INDIA', 'Customs Duty Processing': 'USD 120', 'Documentation Charges': 'USD 80', 'Examination Charges': 'USD 50', 'Amendment Fee': 'USD 0', 'Miscellaneous': 'USD 70', 'Total CHA Charges': 'USD 320' } },
    { rank: 2, vendorName: 'Sharaf Shipping', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 380,
      details: { 'Bid ID': '1528760-CHA002', 'CHA Name': 'Sharaf Shipping Agency', 'Destination Country': 'INDIA', 'Customs Duty Processing': 'USD 140', 'Documentation Charges': 'USD 90', 'Examination Charges': 'USD 60', 'Amendment Fee': 'USD 10', 'Miscellaneous': 'USD 80', 'Total CHA Charges': 'USD 380' } },
    { rank: 3, vendorName: 'Jeena & Co', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 420,
      details: { 'Bid ID': '1528760-CHA003', 'CHA Name': 'Jeena & Co', 'Destination Country': 'INDIA', 'Customs Duty Processing': 'USD 160', 'Documentation Charges': 'USD 100', 'Examination Charges': 'USD 65', 'Amendment Fee': 'USD 15', 'Miscellaneous': 'USD 80', 'Total CHA Charges': 'USD 420' } },
  ]),

  'CFS': (_pol, pod, sd, ed) => makeBids('CFS', '', pod, sd, ed, [
    { rank: 1, vendorName: 'Balmer Lawrie CFS', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 180,
      details: { 'Bid ID': '1528770-CFS001', 'CFS Name': 'Balmer Lawrie CFS', 'CFS Free Days': '3', 'Handling Charges': 'USD 80', 'Destuffing Charges': 'USD 50', 'Lift On/Lift Off': 'USD 30', 'Storage (per day after free)': 'USD 15', 'Total CFS Charges': 'USD 180' } },
    { rank: 2, vendorName: 'Allcargo CFS', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 210,
      details: { 'Bid ID': '1528770-CFS002', 'CFS Name': 'Allcargo CFS', 'CFS Free Days': '2', 'Handling Charges': 'USD 90', 'Destuffing Charges': 'USD 60', 'Lift On/Lift Off': 'USD 35', 'Storage (per day after free)': 'USD 18', 'Total CFS Charges': 'USD 210' } },
    { rank: 3, vendorName: 'Gateway CFS', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 250,
      details: { 'Bid ID': '1528770-CFS003', 'CFS Name': 'Gateway Distriparks CFS', 'CFS Free Days': '2', 'Handling Charges': 'USD 110', 'Destuffing Charges': 'USD 65', 'Lift On/Lift Off': 'USD 40', 'Storage (per day after free)': 'USD 20', 'Total CFS Charges': 'USD 250' } },
  ]),

  'ICD': (_pol, pod, sd, ed) => makeBids('ICD', '', pod, sd, ed, [
    { rank: 1, vendorName: 'CONCOR Tughlakabad', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 280,
      details: { 'Bid ID': '1528780-ICD001', 'ICD Name': 'CONCOR ICD Tughlakabad', 'ICD Free Days': '5', 'Handling Charges': 'USD 100', 'Rail Freight': 'USD 120', 'Lift On/Lift Off': 'USD 35', 'Storage (per day after free)': 'USD 20', 'Total ICD Charges': 'USD 280' } },
    { rank: 2, vendorName: 'CONCOR Dadri', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 320,
      details: { 'Bid ID': '1528780-ICD002', 'ICD Name': 'CONCOR ICD Dadri', 'ICD Free Days': '4', 'Handling Charges': 'USD 110', 'Rail Freight': 'USD 140', 'Lift On/Lift Off': 'USD 40', 'Storage (per day after free)': 'USD 22', 'Total ICD Charges': 'USD 320' } },
    { rank: 3, vendorName: 'Gateway Rail ICD', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 370,
      details: { 'Bid ID': '1528780-ICD003', 'ICD Name': 'Gateway Rail ICD Garhi Harsaru', 'ICD Free Days': '3', 'Handling Charges': 'USD 130', 'Rail Freight': 'USD 160', 'Lift On/Lift Off': 'USD 45', 'Storage (per day after free)': 'USD 25', 'Total ICD Charges': 'USD 370' } },
  ]),

  'Break Bulk Vendor': (pol, pod, sd, ed) => makeBids('Break Bulk Vendor', pol, pod, sd, ed, [
    { rank: 1, vendorName: 'Consolidated Shipping', carrierName: 'BBC Chartering', containerSize: '-', containerType: 'BREAK BULK', transitDays: 25, amount: 8500,
      details: { 'Bid ID': '1528790-BB001', 'Vendor Name': 'Consolidated Shipping', 'Carrier': 'BBC Chartering', 'Cargo Type': 'Break Bulk', 'Stevedoring Charges': 'USD 2000', 'Wharfage': 'USD 500', 'Base Freight': 'USD 5500', 'Insurance': 'USD 500', 'Total Freight': 'USD 8500' } },
    { rank: 2, vendorName: 'SAL Heavy Lift', carrierName: 'Chipolbrok', containerSize: '-', containerType: 'BREAK BULK', transitDays: 28, amount: 9800,
      details: { 'Bid ID': '1528790-BB002', 'Vendor Name': 'SAL Heavy Lift', 'Carrier': 'Chipolbrok', 'Cargo Type': 'Break Bulk', 'Stevedoring Charges': 'USD 2400', 'Wharfage': 'USD 600', 'Base Freight': 'USD 6200', 'Insurance': 'USD 600', 'Total Freight': 'USD 9800' } },
  ]),

  'Surveyor': (_pol, pod, sd, ed) => makeBids('Surveyor', '', pod, sd, ed, [
    { rank: 1, vendorName: 'SGS India', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 450,
      details: { 'Bid ID': '1528800-SUR001', 'Surveyor Name': 'SGS India Pvt Ltd', 'Survey Type': 'Pre-shipment Inspection', 'Inspection Charges': 'USD 300', 'Certification Fee': 'USD 100', 'Travel & Misc': 'USD 50', 'Total Survey Cost': 'USD 450' } },
    { rank: 2, vendorName: 'Bureau Veritas', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, amount: 520,
      details: { 'Bid ID': '1528800-SUR002', 'Surveyor Name': 'Bureau Veritas India', 'Survey Type': 'Pre-shipment Inspection', 'Inspection Charges': 'USD 350', 'Certification Fee': 'USD 120', 'Travel & Misc': 'USD 50', 'Total Survey Cost': 'USD 520' } },
  ]),

  'Transporter': (_pol, pod, sd, ed) => makeBids('Transporter', '', pod, sd, ed, [
    { rank: 1, vendorName: 'TCI Freight', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 2, amount: 650,
      details: { 'Bid ID': '1528810-TR001', 'Transporter Name': 'TCI Freight', 'Pickup Location': pod, 'Delivery Location': 'Customer Warehouse', 'Vehicle Type': '32ft MXL / 40ft Trailer', 'Base Transport Cost': 'USD 480', 'Toll Charges': 'USD 80', 'Loading/Unloading': 'USD 50', 'Misc Charges': 'USD 40', 'Total Transport Cost': 'USD 650' } },
    { rank: 2, vendorName: 'Gati KWE', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 3, amount: 720,
      details: { 'Bid ID': '1528810-TR002', 'Transporter Name': 'Gati KWE', 'Pickup Location': pod, 'Delivery Location': 'Customer Warehouse', 'Vehicle Type': '32ft MXL / 40ft Trailer', 'Base Transport Cost': 'USD 530', 'Toll Charges': 'USD 90', 'Loading/Unloading': 'USD 55', 'Misc Charges': 'USD 45', 'Total Transport Cost': 'USD 720' } },
    { rank: 3, vendorName: 'Rivigo', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 2, amount: 800,
      details: { 'Bid ID': '1528810-TR003', 'Transporter Name': 'Rivigo', 'Pickup Location': pod, 'Delivery Location': 'Customer Warehouse', 'Vehicle Type': '32ft MXL / 40ft Trailer', 'Base Transport Cost': 'USD 600', 'Toll Charges': 'USD 95', 'Loading/Unloading': 'USD 55', 'Misc Charges': 'USD 50', 'Total Transport Cost': 'USD 800' } },
  ]),
};

export function getBidsForVendors(selectedVendors: string[], pol?: string, pod?: string): Bid[] {
  const usePol = pol || 'SHANGHAI';
  const usePod = pod || 'NHAVA SHEVA';
  const sd = '23 Mar 2026';
  const ed = '31 Mar 2026';

  const bids: Bid[] = [];
  for (const vendor of selectedVendors) {
    const generator = VENDOR_TEMPLATES[vendor];
    if (generator) bids.push(...generator(usePol, usePod, sd, ed));
  }
  return bids;
}

// Generate spot bids — higher prices than normal, with spot- prefix ids
export function getSpotBidsForVendors(selectedVendors: string[], pol?: string, pod?: string): Bid[] {
  const normalBids = getBidsForVendors(selectedVendors, pol, pod);
  return normalBids.map(bid => ({
    ...bid,
    id: `spot-${bid.id}`,
    // Spot bids are 30-50% higher than normal
    amount: Math.round(bid.amount * (1.3 + bid.rank * 0.05)),
    details: {
      ...bid.details,
      'Rate Type': 'Spot',
      'Total Freight': `USD ${Math.round(bid.amount * (1.3 + bid.rank * 0.05)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
  }));
}

// Get Normal Rank 1 bids only (for spot reference)
export function getNormalRank1Bids(selectedVendors: string[], pol?: string, pod?: string): Bid[] {
  const allBids = getBidsForVendors(selectedVendors, pol, pod);
  return allBids.filter(b => b.rank === 1);
}

export function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
