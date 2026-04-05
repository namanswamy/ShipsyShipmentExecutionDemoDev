// Bid data generator based on selected vendors
export interface Bid {
  id: string;
  vendorType: string; // FF, CHA, Transporter, etc.
  rank: number;
  ffName: string;
  carrierName: string;
  containerSize: string;
  containerType: string;
  transitDays: number;
  pol: string;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
}

// Demo bid templates per vendor type
const BID_TEMPLATES: Record<string, Bid[]> = {
  'Freight Forwarder': [
    { id: 'ff-1', vendorType: 'Freight Forwarder', rank: 1, ffName: 'Eusu Logistics', carrierName: 'Maersk', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 18, pol: 'SHEKOU', startDate: '23 Mar 2026', endDate: '31 Mar 2026', amount: 5000, currency: 'USD' },
    { id: 'ff-2', vendorType: 'Freight Forwarder', rank: 2, ffName: 'Phoenix Global', carrierName: 'MSC', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 22, pol: 'SHANGHAI', startDate: '25 Mar 2026', endDate: '05 Apr 2026', amount: 5450, currency: 'USD' },
    { id: 'ff-3', vendorType: 'Freight Forwarder', rank: 3, ffName: 'Kuehne+Nagel', carrierName: 'COSCO', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 20, pol: 'NINGBO', startDate: '24 Mar 2026', endDate: '02 Apr 2026', amount: 5800, currency: 'USD' },
  ],
  'Shipping Line': [
    { id: 'sl-1', vendorType: 'Shipping Line', rank: 1, ffName: 'Direct - Maersk', carrierName: 'Maersk', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 16, pol: 'SHEKOU', startDate: '22 Mar 2026', endDate: '28 Mar 2026', amount: 4200, currency: 'USD' },
    { id: 'sl-2', vendorType: 'Shipping Line', rank: 2, ffName: 'Direct - MSC', carrierName: 'MSC', containerSize: "40' HC", containerType: 'STANDARD', transitDays: 19, pol: 'SHANGHAI', startDate: '24 Mar 2026', endDate: '01 Apr 2026', amount: 4550, currency: 'USD' },
    { id: 'sl-3', vendorType: 'Shipping Line', rank: 3, ffName: 'Direct - Hapag-Lloyd', carrierName: 'Hapag-Lloyd', containerSize: "20' GP", containerType: 'STANDARD', transitDays: 21, pol: 'NINGBO', startDate: '26 Mar 2026', endDate: '04 Apr 2026', amount: 4900, currency: 'USD' },
  ],
  'CHA': [
    { id: 'cha-1', vendorType: 'CHA', rank: 1, ffName: 'JM Baxi & Co', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '01 Apr 2026', endDate: '05 Apr 2026', amount: 15000, currency: 'INR' },
    { id: 'cha-2', vendorType: 'CHA', rank: 2, ffName: 'Sharaf Shipping', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '01 Apr 2026', endDate: '06 Apr 2026', amount: 17500, currency: 'INR' },
    { id: 'cha-3', vendorType: 'CHA', rank: 3, ffName: 'Jeena & Co', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '02 Apr 2026', endDate: '07 Apr 2026', amount: 19000, currency: 'INR' },
  ],
  'CFS': [
    { id: 'cfs-1', vendorType: 'CFS', rank: 1, ffName: 'Balmer Lawrie CFS', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '05 Apr 2026', endDate: '08 Apr 2026', amount: 8500, currency: 'INR' },
    { id: 'cfs-2', vendorType: 'CFS', rank: 2, ffName: 'Allcargo CFS', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '05 Apr 2026', endDate: '09 Apr 2026', amount: 9200, currency: 'INR' },
    { id: 'cfs-3', vendorType: 'CFS', rank: 3, ffName: 'Gateway CFS', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '06 Apr 2026', endDate: '10 Apr 2026', amount: 10500, currency: 'INR' },
  ],
  'ICD': [
    { id: 'icd-1', vendorType: 'ICD', rank: 1, ffName: 'CONCOR Tughlakabad', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'DELHI ICD', startDate: '06 Apr 2026', endDate: '09 Apr 2026', amount: 12000, currency: 'INR' },
    { id: 'icd-2', vendorType: 'ICD', rank: 2, ffName: 'CONCOR Dadri', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'DELHI ICD', startDate: '06 Apr 2026', endDate: '10 Apr 2026', amount: 13500, currency: 'INR' },
    { id: 'icd-3', vendorType: 'ICD', rank: 3, ffName: 'Gateway Rail ICD', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'DELHI ICD', startDate: '07 Apr 2026', endDate: '11 Apr 2026', amount: 15000, currency: 'INR' },
  ],
  'Break Bulk Vendor': [
    { id: 'bb-1', vendorType: 'Break Bulk Vendor', rank: 1, ffName: 'Consolidated Shipping', carrierName: 'BBC Chartering', containerSize: '-', containerType: 'BREAK BULK', transitDays: 25, pol: 'JEBEL ALI', startDate: '20 Mar 2026', endDate: '30 Mar 2026', amount: 12000, currency: 'USD' },
    { id: 'bb-2', vendorType: 'Break Bulk Vendor', rank: 2, ffName: 'SAL Heavy Lift', carrierName: 'Chipolbrok', containerSize: '-', containerType: 'BREAK BULK', transitDays: 28, pol: 'JEBEL ALI', startDate: '22 Mar 2026', endDate: '02 Apr 2026', amount: 13800, currency: 'USD' },
  ],
  'Surveyor': [
    { id: 'sur-1', vendorType: 'Surveyor', rank: 1, ffName: 'SGS India', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '01 Apr 2026', endDate: '03 Apr 2026', amount: 25000, currency: 'INR' },
    { id: 'sur-2', vendorType: 'Surveyor', rank: 2, ffName: 'Bureau Veritas', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 0, pol: 'NHAVA SHEVA', startDate: '02 Apr 2026', endDate: '04 Apr 2026', amount: 28000, currency: 'INR' },
  ],
  'Transporter': [
    { id: 'tr-1', vendorType: 'Transporter', rank: 1, ffName: 'TCI Freight', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 2, pol: 'NHAVA SHEVA', startDate: '10 Apr 2026', endDate: '12 Apr 2026', amount: 35000, currency: 'INR' },
    { id: 'tr-2', vendorType: 'Transporter', rank: 2, ffName: 'Gati KWE', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 3, pol: 'NHAVA SHEVA', startDate: '10 Apr 2026', endDate: '13 Apr 2026', amount: 38000, currency: 'INR' },
    { id: 'tr-3', vendorType: 'Transporter', rank: 3, ffName: 'Rivigo', carrierName: '-', containerSize: '-', containerType: '-', transitDays: 2, pol: 'NHAVA SHEVA', startDate: '11 Apr 2026', endDate: '13 Apr 2026', amount: 42000, currency: 'INR' },
  ],
};

export function getBidsForVendors(selectedVendors: string[]): Bid[] {
  const bids: Bid[] = [];
  for (const vendor of selectedVendors) {
    const templates = BID_TEMPLATES[vendor];
    if (templates) bids.push(...templates);
  }
  return bids;
}

export function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
