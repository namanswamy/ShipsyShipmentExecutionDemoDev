import type { Field } from './tasks';

// Field definitions keyed by task name
// Tasks not listed here have no fields (auto/system tasks)
export const TASK_FIELDS: Record<string, { fields: Field[]; docFields?: Field[]; docName?: string }> = {
  'Select Mode of Shipment': { fields: [
    { label: 'Mode', code: 'SMF87', value: 'FCL', type: 'dropdown', req: true, opts: ['FCL', 'LCL', 'AIR', 'BULK (MR)', 'BREAK BULK (MB)'], defaultVal: 'FCL' },
    { label: 'Incoterm', code: 'SMF88', value: 'EXW', type: 'dropdown', req: true, opts: ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'], defaultVal: 'EXW' },
    { label: 'Spot / Normal', value: '', type: 'dropdown', req: true, opts: ['Spot', 'Normal'], note: 'NEW' },
  ] },

  'Select Port Details': { fields: [
    { label: 'Place of Receipt at Origin', code: 'SMF103', value: '', type: 'dropdown', req: true, opts: ['Mundra', 'Nhava Sheva (JNPT)', 'Chennai', 'Kolkata', 'Visakhapatnam', 'Cochin', 'Kandla', 'Tuticorin', 'Mangalore', 'Paradip'] },
    { label: 'Port of Loading', code: 'SMF4', value: '', type: 'dropdown', req: true, opts: ['CNSHA - Shanghai', 'CNNGB - Ningbo', 'SGSIN - Singapore', 'KRPUS - Busan', 'AEJEA - Jebel Ali', 'DEHAM - Hamburg', 'GBFXT - Felixstowe', 'USNYC - New York', 'USLAX - Los Angeles', 'MYPKG - Port Klang', 'THLKR - Laem Chabang', 'BRSSZ - Santos'] },
    { label: 'Port of Discharge', code: 'SMF5', value: '', type: 'dropdown', req: true, opts: ['INNSA - Nhava Sheva', 'INMUN - Mundra', 'INCHE - Chennai', 'INCCU - Kolkata', 'INBOM - Mumbai', 'INTUT - Tuticorin', 'INVTZ - Visakhapatnam', 'INCOK - Cochin'] },
    { label: 'Destination Port', code: 'SMF3', value: '', type: 'dropdown', req: true, opts: ['INNSA - Nhava Sheva', 'INMUN - Mundra', 'INCHE - Chennai', 'INCCU - Kolkata', 'INBOM - Mumbai', 'INDEL - Delhi ICD', 'INAMD - Ahmedabad ICD', 'INBLR - Bangalore ICD'] },
  ] },

  'Enter Container Details': { fields: [
    { label: 'Container Details', code: 'SMF9', value: '', type: 'text', req: true },
    { label: 'Container Type', code: 'SMF10', value: '', type: 'dropdown', req: false, opts: ['Dry', 'Reefer', 'Open Top', 'Flat Rack', 'Tank', 'Hard Top'] },
    { label: 'Container Size', code: 'SMF11', value: '', type: 'dropdown', req: false, opts: ['20ft', '40ft', '40ft HC', '45ft HC'] },
    { label: 'Container Count', code: 'SMF12', value: '', type: 'number', req: false },
    { label: 'Container Total Weight', code: 'SMF13', value: '', type: 'number', req: false },
    { label: 'Container Weight Unit', code: 'SMF14', value: '', type: 'dropdown', req: false, opts: ['KG', 'MT', 'LBS'] },
  ] },

  'Enter Package Details': { fields: [
    { label: 'Package Type', value: '', type: 'dropdown', req: true, opts: ['Cartons', 'Pallets', 'Bags', 'Drums', 'Crates', 'Rolls'] },
    { label: 'Number of Packages', value: '', type: 'number', req: true },
    { label: 'Total Gross Weight (kg)', value: '', type: 'number', req: true },
    { label: 'Total Volume (CBM)', value: '', type: 'number', req: false },
    { label: 'Package Dimensions (L x W x H cm)', value: '', type: 'text', req: false },
  ] },

  'Enter Cargo Volume Details': { fields: [
    { label: 'Cargo Volume (CBM)', value: '', type: 'number', req: true },
    { label: 'Gross Weight (kg)', value: '', type: 'number', req: true },
    { label: 'Net Weight (kg)', value: '', type: 'number', req: false },
    { label: 'Number of Packages', value: '', type: 'number', req: false },
    { label: 'Cargo Description', value: '', type: 'text', req: false },
  ] },

  'Enter Total Weight Details': { fields: [
    { label: 'Total Gross Weight (kg)', value: '', type: 'number', req: true },
    { label: 'Total Chargeable Weight (kg)', value: '', type: 'number', req: true },
    { label: 'Total Volume Weight (kg)', value: '', type: 'number', req: false },
    { label: 'Number of Pieces', value: '', type: 'number', req: true },
    { label: 'Cargo Dimensions (L x W x H cm)', value: '', type: 'text', req: false },
  ] },

  'Vendor Selection': { fields: [
    { label: 'Vendor Selection', value: '', type: 'addmore', req: true, opts: ['Freight Forwarder', 'Shipping Line', 'CHA', 'CFS', 'ICD', 'Break Bulk Vendor', 'Surveyor', 'Transporter'], note: '+ Add More for multi-value' },
    { label: 'Segment', value: '', type: 'dropdown', req: false, opts: ['DPD', 'DPD CFS', 'Non DPD'], note: 'If CFS/ICD selected' },
    { label: 'Category', value: '', type: 'dropdown', req: false, opts: ['General In-gauge', 'General Out-gauge', 'Haz cargo', 'Reefer'], note: 'If CFS/ICD selected' },
    { label: 'Destuff Indicator', value: '', type: 'dropdown', req: false, opts: ['Loaded', 'Destuffed'], note: 'If CFS/ICD selected' },
    { label: 'Panel Identifier', value: '', type: 'dropdown', req: false, opts: ['Panel Lines (Off dock)', 'Panel Lines (Non off dock)', 'Non Panel Lines'], note: 'If CFS/ICD selected' },
    { label: 'Buffer Days', value: '14 days', type: 'dropdown', req: false, opts: ['7 days', '14 days', '21 days'], defaultVal: '14 days', note: 'If CFS/ICD selected' },
  ] },

  'Run Global Plan Optimizer': { fields: [
    { label: 'Bid Details', code: 'SMF27', value: '', type: 'text', req: true },
    { label: 'Bid Rank', code: 'SMF28', value: '', type: 'number', req: false },
    { label: 'Bid Validity Start', code: 'SMF29', value: '', type: 'date', req: false },
    { label: 'Bid Validity End', code: 'SMF30', value: '', type: 'date', req: false },
  ] },

  'Approval of L1 Deviation': { fields: [
    { label: 'Bid Details', code: 'SMF27', value: '', type: 'text', req: true },
    { label: 'Reason for Deviation', value: '', type: 'dropdown', req: true, opts: ['Rate higher than L1', 'Preferred carrier unavailable', 'Schedule mismatch', 'Equipment unavailability', 'Port congestion', 'Customer request', 'Other'], note: 'NEW' },
    { label: 'Remark', value: '', type: 'text', req: false, note: 'NEW' },
  ] },

  'Select Sailing Schedule': { fields: [
    { label: 'Sailing Schedule Details', code: 'SMF31', value: '', type: 'text', req: true },
    { label: 'Sailing Date as per Schedule', code: 'SMF32', value: '', type: 'date', req: false },
    { label: 'Vessel Name as per Schedule', code: 'SMF33', value: '', type: 'text', req: false },
  ] },

  'Confirm Sailing Schedule': { fields: [
    { label: 'Sailing Schedule Details', code: 'SMF31', value: '', type: 'text', req: true },
    { label: 'Sailing Date as per Schedule', code: 'SMF32', value: '', type: 'date', req: false },
    { label: 'Vessel Name as per Schedule', code: 'SMF33', value: '', type: 'text', req: false },
  ] },

  'Upload Booking Note': { fields: [
    { label: 'Booking Date Info', code: 'SMF96', value: '', type: 'text', req: false },
  ], docName: 'Booking Note (FCL)', docFields: [
    { label: 'Booking Number', code: 'SMF34', value: '', type: 'text', req: true },
    { label: 'Sailing Date', code: 'SMF112', value: '', type: 'date', req: false },
    { label: 'Number of Containers', code: 'SMF111', value: '', type: 'number', req: false },
    { label: 'Bill Validity', code: 'SMF40', value: '', type: 'date', req: false },
    { label: 'SI Cut-off', code: 'SMF42', value: '', type: 'datetime', req: false },
    { label: 'Document Cut-off', code: 'SMF39', value: '', type: 'datetime', req: false },
    { label: 'VGM Cut-off', code: 'SMF37', value: '', type: 'datetime', req: false },
    { label: 'Gate Open', code: 'SMF38', value: '', type: 'datetime', req: false },
    { label: 'Gate-in Cut-off', code: 'SMF41', value: '', type: 'datetime', req: false },
    { label: 'Vessel Name', code: 'SMF110', value: '', type: 'text', req: false },
    { label: 'Yard Details', code: 'SMF43', value: '', type: 'text', req: false },
    { label: 'Arrival Date', code: 'SMF89', value: '', type: 'date', req: false },
  ] },

  'Provide Booking Note': { fields: [
    { label: 'Booking Number', value: '', type: 'text', req: true },
    { label: 'Booking Date', value: '', type: 'date', req: true },
    { label: 'Vessel / Flight Details', value: '', type: 'text', req: false },
    { label: 'ETD', value: '', type: 'date', req: false },
    { label: 'ETA', value: '', type: 'date', req: false },
  ] },

  'Provide Air Booking Note': { fields: [
    { label: 'Booking Number', value: '', type: 'text', req: true },
    { label: 'Airline', value: '', type: 'text', req: true },
    { label: 'Flight Number', value: '', type: 'text', req: false },
    { label: 'ETD', value: '', type: 'date', req: false },
    { label: 'ETA', value: '', type: 'date', req: false },
    { label: 'Chargeable Weight (kg)', value: '', type: 'number', req: false },
  ] },

  'Approve Booking Note': { fields: [
    { label: 'Booking Number', code: 'SMF34', value: '', type: 'text', req: true },
    { label: 'Sailing Date as per BN', code: 'SMF35', value: '', type: 'date', req: true },
    { label: 'Vessel Name as per BN', code: 'SMF36', value: '', type: 'text', req: true },
    { label: 'VGM Cut-off', code: 'SMF37', value: '', type: 'datetime', req: true },
    { label: 'Gate Open', code: 'SMF38', value: '', type: 'datetime', req: true },
    { label: 'Document Cut-off', code: 'SMF39', value: '', type: 'datetime', req: true },
    { label: 'Bill Validity', code: 'SMF40', value: '', type: 'date', req: true },
    { label: 'Gate-in Cut-off', code: 'SMF41', value: '', type: 'datetime', req: true },
    { label: 'SI Cut-off', code: 'SMF42', value: '', type: 'datetime', req: true },
    { label: 'Yard Details', code: 'SMF43', value: '', type: 'text', req: true },
  ] },

  'Approve Air Booking Note': { fields: [
    { label: 'Booking Number', value: '', type: 'text', req: true },
    { label: 'Airline', value: '', type: 'text', req: true },
    { label: 'Flight Number', value: '', type: 'text', req: true },
    { label: 'ETD', value: '', type: 'date', req: true },
    { label: 'ETA', value: '', type: 'date', req: true },
  ] },

  'Empty Container Pick-up Details': { fields: [
    { label: 'Empty Container Pickup Date', value: '', type: 'date', req: true },
  ] },

  'Cargo Gate in Time': { fields: [
    { label: 'Gate-in Date & Time', value: '', type: 'datetime', req: true },
    { label: 'Gate-in Location', value: '', type: 'text', req: false },
    { label: 'Remarks', value: '', type: 'text', req: false },
  ] },

  'Enter Container Weight Details': { fields: [
    { label: 'Gross Weight', code: 'SMF62', value: '', type: 'number', req: true },
    { label: 'Net Weight', code: 'SMF63', value: '', type: 'number', req: true },
    { label: 'Tare Weight', code: 'SMF64', value: '', type: 'number', req: true },
    { label: 'UOM', code: 'SMF65', value: '', type: 'dropdown', req: true, opts: ['KG', 'MT', 'LBS', 'CBM'] },
    { label: 'Seal Number', code: 'SMF66', value: '', type: 'text', req: true },
    { label: 'Container Type as per Tracking', code: 'SMF108', value: '', type: 'text', req: true },
    { label: 'Container Size as per Tracking', code: 'SMF109', value: '', type: 'text', req: true },
  ] },

  'Enter Cargo Handover Time': { fields: [
    { label: 'Cargo Handover Date & Time', value: '', type: 'datetime', req: true },
    { label: 'Handover Location', value: '', type: 'text', req: false },
    { label: 'Receiver Name', value: '', type: 'text', req: false },
    { label: 'Remarks', value: '', type: 'text', req: false },
  ] },

  'Upload Commercial Invoice & Packing List': { fields: [
    { label: 'Commercial Invoice', value: '', type: 'upload', req: true },
    { label: 'Packing List', value: '', type: 'upload', req: true },
  ] },

  'Cargo On-board Time': { fields: [
    { label: 'Cargo On-board Date & Time', value: '', type: 'datetime', req: true },
    { label: 'Vessel / Flight Name', value: '', type: 'text', req: false },
    { label: 'Voyage / Flight Number', value: '', type: 'text', req: false },
    { label: 'Remarks', value: '', type: 'text', req: false },
  ] },

  'Upload Draft BL': { fields: [
    { label: 'Draft BL', value: '', type: 'upload', req: true },
  ] },

  'Upload Draft AWB': { fields: [
    { label: 'Draft AWB', value: '', type: 'upload', req: true },
  ] },

  'Approve Draft BL': { fields: [
    { label: '(Negotiable soft approval)', value: 'No hardcoded fields', type: 'auto', req: false },
  ] },

  'Approve Draft AWB': { fields: [
    { label: '(Negotiable soft approval)', value: 'No hardcoded fields', type: 'auto', req: false },
  ] },

  'Upload Final BL & Freight Certificate': { fields: [], docName: 'Final BL (FCL)', docFields: [
    { label: 'House BL Number', code: 'SMF55', value: '', type: 'text', req: true },
    { label: 'House BL Date', code: 'SMF56', value: '', type: 'date', req: true },
    { label: 'Master BL Number', code: 'SMF45', value: '', type: 'text', req: true },
    { label: 'Master BL Date', code: 'SMF46', value: '', type: 'date', req: true },
    { label: 'Container Number List', code: 'SMF61', value: '', type: 'text', req: true },
    { label: 'Actual Departure Date', code: 'SMF93', value: '', type: 'date', req: true },
    { label: 'Vessel Name as per BL', code: 'SMF53', value: '', type: 'text', req: true },
    { label: 'Vessel Number', code: 'SMF58', value: '', type: 'text', req: true },
    { label: 'Voyage No', code: 'SMF54', value: '', type: 'text', req: true },
    { label: 'Net Weight per BL', code: 'SMF51', value: '', type: 'number', req: true },
    { label: 'Net Weight per BL UOM', code: 'SMF52', value: '', type: 'dropdown', req: true, opts: ['KG', 'MT', 'LBS'] },
    { label: 'Gross Weight per BL', code: 'SMF49', value: '', type: 'number', req: true },
    { label: 'Gross Weight per BL UOM', code: 'SMF50', value: '', type: 'dropdown', req: true, opts: ['KG', 'MT', 'LBS'] },
    { label: 'Destination Arrival Date', code: 'SMF135', value: '', type: 'date', req: true },
  ] },

  'Upload Final AWB & Freight Certificate': { fields: [], docName: 'Final AWB', docFields: [
    { label: 'AWB Number', value: '', type: 'text', req: true },
    { label: 'AWB Date', value: '', type: 'date', req: true },
    { label: 'Airline', value: '', type: 'text', req: true },
    { label: 'Flight Number', value: '', type: 'text', req: true },
    { label: 'Actual Departure Date', value: '', type: 'date', req: true },
    { label: 'ETA Destination', value: '', type: 'date', req: true },
    { label: 'Chargeable Weight', value: '', type: 'number', req: true },
    { label: 'Gross Weight', value: '', type: 'number', req: true },
  ] },

  'Approve Final BL': { fields: [
    { label: '(Soft-approval task)', value: 'No hardcoded fields', type: 'auto', req: false },
  ] },

  'Approve Final AWB': { fields: [
    { label: '(Soft-approval task)', value: 'No hardcoded fields', type: 'auto', req: false },
  ] },

  'Courier Docket Details Upload': { fields: [
    { label: 'AWB Number', code: 'SMF81', value: '', type: 'text', req: true },
    { label: 'Courier Company', code: 'SMF82', value: '', type: 'text', req: true },
    { label: 'Courier Receiving Address', code: 'SMF83', value: '', type: 'text', req: true },
  ] },

  'Upload Cargo Arrival Notice': { fields: [], docName: 'CAN', docFields: [
    { label: 'IGM Number', code: 'SMF74', value: '', type: 'text', req: true },
    { label: 'IGM Item Number', code: 'SMF75', value: '', type: 'text', req: true },
    { label: 'IGM Sub-item Number', code: 'SMF76', value: '', type: 'text', req: true },
    { label: 'Inward Entry Date', code: 'SMF79', value: '', type: 'date', req: true },
    { label: 'Gateway IGM Date', code: 'SMF80', value: '', type: 'date', req: true },
    { label: 'Vessel IMO', code: 'SMF78', value: '', type: 'text', req: true },
    { label: 'Vessel Code', code: 'SMF77', value: '', type: 'text', req: true },
  ] },

  'Upload Bill of Entry Details': { fields: [
    { label: 'BOE Number', code: 'SMF84', value: '', type: 'text', req: true },
    { label: 'BOE Entry Port', code: 'SMF85', value: '', type: 'text', req: true },
    { label: 'BOE Entry Date', code: 'SMF86', value: '', type: 'date', req: true },
  ] },

  'Upload BOE Details': { fields: [
    { label: 'BOE Number', value: '', type: 'text', req: true },
    { label: 'BOE Entry Port', value: '', type: 'text', req: true },
    { label: 'BOE Entry Date', value: '', type: 'date', req: true },
  ] },

  'Upload Delivery Order': { fields: [], docName: 'DO', docFields: [
    { label: 'DO Number', code: 'SMF67', value: '', type: 'text', req: true },
    { label: 'DO Date', code: 'SMF68', value: '', type: 'date', req: true },
    { label: 'BL Number List', code: 'SMF73', value: '', type: 'text', req: true },
    { label: 'DO Expiry Time', code: 'SMF70', value: '', type: 'datetime', req: true },
    { label: 'Detention Free Expiry Time', code: 'SMF69', value: '', type: 'datetime', req: true },
    { label: 'Laden Container Yard', code: 'SMF72', value: '', type: 'text', req: true },
    { label: 'Empty Container Yard', code: 'SMF71', value: '', type: 'text', req: true },
  ] },

  'Vehicle Loading Confirmation': { fields: [
    { label: 'Container Loaded At', value: '', type: 'text', req: false },
  ] },

  'Detention Free Time': { fields: [
    { label: 'Detention Free Time', value: '', type: 'text', req: true },
  ] },

  'FF Incidental Events': { fields: [
    { label: 'Incidental Charges', value: '', type: 'addmore', req: true, opts: ['Demurrage', 'Detention', 'THC', 'Documentation Fee', 'Fumigation', 'Scanning', 'Weighment', 'Lashing/Choking', 'CFS Charges', 'Lift On/Lift Off', 'Survey Fee', 'Amendment Fee', 'Warehousing', 'Transportation', 'Other'] },
    { label: 'Type of Charge', value: 'Auto-fill', type: 'auto', req: false },
  ] },

  'CHA Incidental Events': { fields: [
    { label: 'Incidental Charges', value: '', type: 'addmore', req: true, opts: ['Demurrage', 'Detention', 'THC', 'Documentation Fee', 'Fumigation', 'Scanning', 'Weighment', 'Lashing/Choking', 'CFS Charges', 'Lift On/Lift Off', 'Survey Fee', 'Amendment Fee', 'Warehousing', 'Transportation', 'Other'] },
    { label: 'Type of Charge', value: 'Auto-fill', type: 'auto', req: false },
  ] },

  'Confirm CFS Vendor': { fields: [
    { label: 'CFS Vendors', value: '', type: 'addmore', req: true, opts: ['CFS 1', 'CFS 2', 'CFS 3', 'CFS 4', 'CFS 5', 'CFS 6', 'CFS 7', 'CFS 8', 'CFS 9', 'CFS 10'] },
  ] },

  'CFS Gate in Date & Time': { fields: [
    { label: 'CFS Gate In Date & Time', value: '', type: 'datetime', req: true },
  ] },

  'CFS Destuff Indicator Confirmation': { fields: [
    { label: 'CFS Destuff Indicator', value: '', type: 'text', req: true },
  ] },

  'CFS Gate out Date & Time': { fields: [
    { label: 'CFS Gate Out Date & Time', value: '', type: 'datetime', req: true },
  ] },

  'CFS Incidental Events': { fields: [
    { label: 'Incidental Charges', value: '', type: 'addmore', req: true, opts: ['Demurrage', 'Detention', 'THC', 'Documentation Fee', 'Fumigation', 'Scanning', 'Weighment', 'Lashing/Choking', 'CFS Charges', 'Lift On/Lift Off', 'Survey Fee', 'Amendment Fee', 'Warehousing', 'Transportation', 'Other'] },
    { label: 'Type of Charge', value: 'Auto-fill', type: 'auto', req: false },
  ] },

  'ICD Gate in Date & Time': { fields: [
    { label: 'ICD Gate In Date & Time', value: '', type: 'datetime', req: true },
  ] },

  'ICD Destuff Indicator Confirmation': { fields: [
    { label: 'ICD Destuff Indicator', value: '', type: 'text', req: true },
  ] },

  'ICD Gate out Date & Time': { fields: [
    { label: 'ICD Gate Out Date & Time', value: '', type: 'datetime', req: true },
  ] },

  'ICD Incidental Events': { fields: [
    { label: 'Incidental Charges', value: '', type: 'addmore', req: true, opts: ['Demurrage', 'Detention', 'THC', 'Documentation Fee', 'Fumigation', 'Scanning', 'Weighment', 'Lashing/Choking', 'CFS Charges', 'Lift On/Lift Off', 'Survey Fee', 'Amendment Fee', 'Warehousing', 'Transportation', 'Other'] },
    { label: 'Type of Charge', value: 'Auto-fill', type: 'auto', req: false },
  ] },

  'Transporter Confirmation': { fields: [
    { label: 'Transporter', value: '', type: 'addmore', req: true, opts: ['Transporter 1', 'Transporter 2', 'Transporter 3', 'Transporter 4', 'Transporter 5', 'Transporter 6', 'Transporter 7', 'Transporter 8', 'Transporter 9', 'Transporter 10'] },
  ] },

  'Carrier Confirmation': { fields: [
    { label: 'Carrier Confirmation Status', value: '', type: 'dropdown', req: true, opts: ['Confirmed', 'Pending', 'Rejected'] },
    { label: 'Vehicle Number', value: '', type: 'text', req: true },
    { label: 'Driver Name', value: '', type: 'text', req: true },
    { label: 'Driver Mobile', value: '', type: 'text', req: true },
  ] },

  'Consignment Note & Eway Bill': { fields: [
    { label: 'Consignment Note', value: '', type: 'text', req: true },
    { label: 'Eway Bill Number', value: '', type: 'text', req: true },
  ] },

  'Empty Container Return Details': { fields: [
    { label: 'Empty Container Return Date', value: '', type: 'date', req: true },
  ] },

  'Transporter Incidental Events': { fields: [
    { label: 'Incidental Charges', value: '', type: 'addmore', req: true, opts: ['Demurrage', 'Detention', 'THC', 'Documentation Fee', 'Fumigation', 'Scanning', 'Weighment', 'Lashing/Choking', 'CFS Charges', 'Lift On/Lift Off', 'Survey Fee', 'Amendment Fee', 'Warehousing', 'Transportation', 'Other'] },
    { label: 'Type of Charge', value: 'Auto-fill', type: 'auto', req: false },
  ] },

  'Confirm ICD Vendor': { fields: [
    { label: 'ICD Vendors', value: '', type: 'addmore', req: true, opts: ['ICD 1', 'ICD 2', 'ICD 3', 'ICD 4', 'ICD 5', 'ICD 6', 'ICD 7', 'ICD 8', 'ICD 9', 'ICD 10'] },
  ] },
};
