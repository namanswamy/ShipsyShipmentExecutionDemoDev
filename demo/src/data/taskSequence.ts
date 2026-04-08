// Task sequence configuration per mode
// Each entry: { seq, assignee, taskByMode: { FCL, LCL, AIR, BB, BULK } }
// null means task doesn't exist for that mode

export type ShipmentMode = 'FCL' | 'LCL' | 'AIR' | 'BB' | 'BULK';

export interface SequenceEntry {
  seq: number;
  assignee: string; // 'Ops' | 'FF' | 'CHA' | 'CFS' | 'ICD' | 'Transporter'
  milestone: string;
  taskByMode: Partial<Record<ShipmentMode, string>>;
  // Which persona tab this task belongs to
  persona: string;
  // Whether this is a CFS-only or ICD-only block task
  vendorBlock?: 'CFS' | 'ICD';
  // FCL-only flag for certain tasks
  fclOnly?: boolean;
}

export const TASK_SEQUENCE: SequenceEntry[] = [
  // ═══ DRAFTS ═══
  { seq: 1, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { FCL: 'Select Mode of Shipment', LCL: 'Select Mode of Shipment', AIR: 'Select Mode of Shipment', BB: 'Select Mode of Shipment', BULK: 'Select Mode of Shipment' } },
  { seq: 2, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { FCL: 'Select Port Details', LCL: 'Select Port Details', AIR: 'Select Port Details', BB: 'Select Port Details', BULK: 'Select Port Details' } },
  { seq: 3, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { FCL: 'Enter Container Details', LCL: 'Enter Package Details', AIR: 'Enter Package Details' } },
  { seq: 4, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { LCL: 'Enter Cargo Volume Details', AIR: 'Enter Total Weight Details', BB: 'Enter Cargo Volume Details', BULK: 'Enter Cargo Volume Details' } },
  { seq: 5, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { FCL: 'Vendor Selection', LCL: 'Vendor Selection', AIR: 'Vendor Selection', BB: 'Vendor Selection', BULK: 'Vendor Selection' } },
  { seq: 6, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { FCL: 'Run Global Plan Optimizer', LCL: 'Run Global Plan Optimizer', AIR: 'Run Global Plan Optimizer', BB: 'Run Global Plan Optimizer', BULK: 'Run Global Plan Optimizer' } },
  { seq: 7, assignee: 'Ops', milestone: 'Drafts', persona: 'Shipper',
    taskByMode: { FCL: 'Approval of L1 Deviation', LCL: 'Approval of L1 Deviation', AIR: 'Approval of L1 Deviation', BB: 'Approval of L1 Deviation', BULK: 'Approval of L1 Deviation' } },

  // ═══ ORIGIN ═══
  { seq: 8, assignee: 'Ops', milestone: 'Origin', persona: 'Shipper', fclOnly: true,
    taskByMode: { FCL: 'Select Sailing Schedule' } },
  { seq: 9, assignee: 'FF', milestone: 'Origin', persona: 'FF', fclOnly: true,
    taskByMode: { FCL: 'Confirm Sailing Schedule' } },
  { seq: 10, assignee: 'FF', milestone: 'Origin', persona: 'FF',
    taskByMode: { FCL: 'Upload Booking Note', LCL: 'Provide Booking Note', AIR: 'Provide Air Booking Note', BB: 'Provide Booking Note', BULK: 'Provide Booking Note' } },
  { seq: 11, assignee: 'Ops', milestone: 'Origin', persona: 'Shipper',
    taskByMode: { FCL: 'Approve Booking Note', LCL: 'Approve Booking Note', AIR: 'Approve Air Booking Note', BB: 'Approve Booking Note', BULK: 'Approve Booking Note' } },
  { seq: 12, assignee: 'FF', milestone: 'Origin', persona: 'FF',
    taskByMode: { FCL: 'Empty Container Pick-up Details', LCL: 'Cargo Gate in Time', AIR: 'Cargo Gate in Time', BB: 'Cargo Gate in Time', BULK: 'Cargo Gate in Time' } },
  { seq: 13, assignee: 'FF', milestone: 'Origin', persona: 'FF',
    taskByMode: { FCL: 'Enter Container Weight Details', LCL: 'Enter Cargo Handover Time', BB: 'Enter Cargo Handover Time', BULK: 'Enter Cargo Handover Time' } },
  { seq: 14, assignee: 'FF', milestone: 'Origin', persona: 'FF',
    taskByMode: { FCL: 'Upload Commercial Invoice & Packing List', LCL: 'Upload Commercial Invoice & Packing List', AIR: 'Upload Commercial Invoice & Packing List', BB: 'Upload Commercial Invoice & Packing List', BULK: 'Upload Commercial Invoice & Packing List' } },
  { seq: 15, assignee: 'FF', milestone: 'Origin', persona: 'FF',
    taskByMode: { LCL: 'Cargo On-board Time', AIR: 'Cargo On-board Time', BB: 'Cargo On-board Time', BULK: 'Cargo On-board Time' } },
  { seq: 16, assignee: 'FF', milestone: 'Origin', persona: 'FF',
    taskByMode: { FCL: 'Upload Draft BL', LCL: 'Upload Draft BL', AIR: 'Upload Draft AWB', BB: 'Upload Draft BL', BULK: 'Upload Draft BL' } },
  { seq: 17, assignee: 'Ops', milestone: 'Origin', persona: 'Shipper',
    taskByMode: { FCL: 'Approve Draft BL', LCL: 'Approve Draft BL', AIR: 'Approve Draft AWB', BB: 'Approve Draft BL', BULK: 'Approve Draft BL' } },

  // ═══ IN TRANSIT ═══
  { seq: 18, assignee: 'FF', milestone: 'In Transit', persona: 'FF',
    taskByMode: { FCL: 'Upload Final BL & Freight Certificate', LCL: 'Upload Final BL & Freight Certificate', AIR: 'Upload Final AWB & Freight Certificate', BB: 'Upload Final BL & Freight Certificate', BULK: 'Upload Final BL & Freight Certificate' } },
  { seq: 19, assignee: 'Ops', milestone: 'In Transit', persona: 'Shipper',
    taskByMode: { FCL: 'Approve Final BL', LCL: 'Approve Final BL', AIR: 'Approve Final AWB', BB: 'Approve Final BL', BULK: 'Approve Final BL' } },
  { seq: 20, assignee: 'Ops', milestone: 'In Transit', persona: 'Shipper',
    taskByMode: { FCL: 'Courier Docket Details Upload', LCL: 'Courier Docket Details Upload', AIR: 'Courier Docket Details Upload', BB: 'Courier Docket Details Upload', BULK: 'Courier Docket Details Upload' } },
  { seq: 21, assignee: 'ULIP/FF', milestone: 'In Transit', persona: 'FF',
    taskByMode: { FCL: 'Upload Cargo Arrival Notice', LCL: 'Upload Cargo Arrival Notice', AIR: 'Upload Cargo Arrival Notice', BB: 'Upload Cargo Arrival Notice', BULK: 'Upload Cargo Arrival Notice' } },

  // ═══ DESTINATION ═══
  { seq: 22, assignee: 'ULIP/Ops', milestone: 'Destination', persona: 'Shipper',
    taskByMode: { FCL: 'Upload Bill of Entry Details', LCL: 'Upload BOE Details', AIR: 'Upload BOE Details', BB: 'Upload BOE Details', BULK: 'Upload BOE Details' } },
  { seq: 23, assignee: 'FF', milestone: 'Destination', persona: 'FF',
    taskByMode: { FCL: 'Upload Delivery Order', LCL: 'Upload Delivery Order', AIR: 'Upload Delivery Order', BB: 'Upload Delivery Order', BULK: 'Upload Delivery Order' } },
  { seq: 24, assignee: 'Ops', milestone: 'Destination', persona: 'Shipper',
    taskByMode: { FCL: 'Vehicle Loading Confirmation', LCL: 'Vehicle Loading Confirmation', AIR: 'Vehicle Loading Confirmation', BB: 'Vehicle Loading Confirmation', BULK: 'Vehicle Loading Confirmation' } },
  { seq: 25, assignee: 'Ops', milestone: 'Destination', persona: 'Shipper',
    taskByMode: { FCL: 'Detention Free Time', LCL: 'Detention Free Time', AIR: 'Detention Free Time', BB: 'Detention Free Time', BULK: 'Detention Free Time' } },
  { seq: 26, assignee: 'FF', milestone: 'Destination', persona: 'FF',
    taskByMode: { FCL: 'FF Incidental Events', LCL: 'FF Incidental Events', AIR: 'FF Incidental Events', BB: 'FF Incidental Events', BULK: 'FF Incidental Events' } },
  { seq: 26.5, assignee: 'FF', milestone: 'Destination', persona: 'FF',
    taskByMode: { FCL: 'FF Charge Confirmation & Invoicing', LCL: 'FF Charge Confirmation & Invoicing', AIR: 'FF Charge Confirmation & Invoicing', BB: 'FF Charge Confirmation & Invoicing', BULK: 'FF Charge Confirmation & Invoicing' } },
  { seq: 27, assignee: 'CHA', milestone: 'Destination', persona: 'CHA',
    taskByMode: { FCL: 'CHA Incidental Events', LCL: 'CHA Incidental Events', AIR: 'CHA Incidental Events', BB: 'CHA Incidental Events', BULK: 'CHA Incidental Events' } },
  { seq: 27.5, assignee: 'CHA', milestone: 'Destination', persona: 'CHA',
    taskByMode: { FCL: 'CHA Charge Confirmation & Invoicing', LCL: 'CHA Charge Confirmation & Invoicing', AIR: 'CHA Charge Confirmation & Invoicing', BB: 'CHA Charge Confirmation & Invoicing', BULK: 'CHA Charge Confirmation & Invoicing' } },
  { seq: 28, assignee: 'Ops', milestone: 'Destination', persona: 'Shipper', vendorBlock: 'CFS',
    taskByMode: { FCL: 'Confirm CFS Vendor', LCL: 'Confirm CFS Vendor', AIR: 'Confirm CFS Vendor', BB: 'Confirm CFS Vendor', BULK: 'Confirm CFS Vendor' } },
  { seq: 28, assignee: 'Ops', milestone: 'Destination', persona: 'Shipper', vendorBlock: 'ICD',
    taskByMode: { FCL: 'Confirm ICD Vendor', LCL: 'Confirm ICD Vendor', AIR: 'Confirm ICD Vendor', BB: 'Confirm ICD Vendor', BULK: 'Confirm ICD Vendor' } },

  // CFS block
  { seq: 29, assignee: 'CFS', milestone: 'Destination', persona: 'CFS', vendorBlock: 'CFS',
    taskByMode: { FCL: 'CFS Gate in Date & Time', LCL: 'CFS Gate in Date & Time', AIR: 'CFS Gate in Date & Time', BB: 'CFS Gate in Date & Time', BULK: 'CFS Gate in Date & Time' } },
  { seq: 30, assignee: 'CFS', milestone: 'Destination', persona: 'CFS', vendorBlock: 'CFS', fclOnly: true,
    taskByMode: { FCL: 'CFS Destuff Indicator Confirmation' } },
  { seq: 31, assignee: 'CFS', milestone: 'Destination', persona: 'CFS', vendorBlock: 'CFS',
    taskByMode: { FCL: 'CFS Gate out Date & Time', LCL: 'CFS Gate out Date & Time', AIR: 'CFS Gate out Date & Time', BB: 'CFS Gate out Date & Time', BULK: 'CFS Gate out Date & Time' } },
  { seq: 32, assignee: 'CFS', milestone: 'Destination', persona: 'CFS', vendorBlock: 'CFS',
    taskByMode: { FCL: 'CFS Incidental Events', LCL: 'CFS Incidental Events', AIR: 'CFS Incidental Events', BB: 'CFS Incidental Events', BULK: 'CFS Incidental Events' } },

  // ICD block (same seq numbers, parallel with CFS)
  { seq: 29, assignee: 'ICD', milestone: 'Destination', persona: 'ICD', vendorBlock: 'ICD',
    taskByMode: { FCL: 'ICD Gate in Date & Time', LCL: 'ICD Gate in Date & Time', AIR: 'ICD Gate in Date & Time', BB: 'ICD Gate in Date & Time', BULK: 'ICD Gate in Date & Time' } },
  { seq: 30, assignee: 'ICD', milestone: 'Destination', persona: 'ICD', vendorBlock: 'ICD', fclOnly: true,
    taskByMode: { FCL: 'ICD Destuff Indicator Confirmation' } },
  { seq: 31, assignee: 'ICD', milestone: 'Destination', persona: 'ICD', vendorBlock: 'ICD',
    taskByMode: { FCL: 'ICD Gate out Date & Time', LCL: 'ICD Gate out Date & Time', AIR: 'ICD Gate out Date & Time', BB: 'ICD Gate out Date & Time', BULK: 'ICD Gate out Date & Time' } },
  { seq: 32, assignee: 'ICD', milestone: 'Destination', persona: 'ICD', vendorBlock: 'ICD',
    taskByMode: { FCL: 'ICD Incidental Events', LCL: 'ICD Incidental Events', AIR: 'ICD Incidental Events', BB: 'ICD Incidental Events', BULK: 'ICD Incidental Events' } },

  { seq: 33, assignee: 'Ops', milestone: 'Destination', persona: 'Shipper',
    taskByMode: { FCL: 'Transporter Confirmation', LCL: 'Transporter Confirmation', AIR: 'Transporter Confirmation', BB: 'Transporter Confirmation', BULK: 'Transporter Confirmation' } },
  { seq: 34, assignee: 'Transporter', milestone: 'Destination', persona: 'Transporter',
    taskByMode: { FCL: 'Carrier Confirmation', LCL: 'Carrier Confirmation', AIR: 'Carrier Confirmation', BB: 'Carrier Confirmation', BULK: 'Carrier Confirmation' } },
  { seq: 35, assignee: 'Transporter', milestone: 'Destination', persona: 'Transporter',
    taskByMode: { FCL: 'Consignment Note & Eway Bill', LCL: 'Consignment Note & Eway Bill', AIR: 'Consignment Note & Eway Bill', BB: 'Consignment Note & Eway Bill', BULK: 'Consignment Note & Eway Bill' } },
  { seq: 36, assignee: 'Transporter', milestone: 'Destination', persona: 'Transporter', fclOnly: true,
    taskByMode: { FCL: 'Empty Container Return Details' } },
  { seq: 37, assignee: 'Transporter', milestone: 'Destination', persona: 'Transporter',
    taskByMode: { FCL: 'Transporter Incidental Events', LCL: 'Transporter Incidental Events', AIR: 'Transporter Incidental Events', BB: 'Transporter Incidental Events', BULK: 'Transporter Incidental Events' } },
];

// Incoterm groupings
const C_INCOTERMS = ['CIF', 'CFR', 'CPT', 'CIP'];
const D_INCOTERMS = ['DAP', 'DPU', 'DDP'];

// Get visible personas for incoterm
const HIDDEN_PERSONAS_C = ['FF'];
const HIDDEN_PERSONAS_D = ['FF', 'CHA', 'CFS', 'ICD'];

export function getActivePersonas(incoterm: string): string[] {
  if (C_INCOTERMS.includes(incoterm)) {
    return ['Shipper', 'CHA', 'CFS', 'ICD', 'Transporter'].filter(p => !HIDDEN_PERSONAS_C.includes(p === 'Shipper' ? '' : p));
  }
  if (D_INCOTERMS.includes(incoterm)) {
    return ['Shipper', 'Transporter'];
  }
  return ['Shipper', 'FF', 'CHA', 'CFS', 'ICD', 'Transporter'];
}

export function getHiddenPersonasForIncoterm(incoterm: string): string[] {
  if (C_INCOTERMS.includes(incoterm)) return HIDDEN_PERSONAS_C;
  if (D_INCOTERMS.includes(incoterm)) return HIDDEN_PERSONAS_D;
  return [];
}

// Build the filtered task list for a shipment
export interface ResolvedTask {
  seq: number;
  name: string;
  assignee: string;
  milestone: string;
  persona: string;
  vendorBlock?: 'CFS' | 'ICD';
  approved: boolean;
  isNew: boolean;
  taskKey: string; // unique key for this task
}

// Task approval mapping
const APPROVED_TASKS = [
  'Run Global Plan Optimizer', 'Approval of L1 Deviation',
  'Approve Booking Note', 'Approve Air Booking Note',
  'Approve Draft BL', 'Approve Draft AWB',
  'Approve Final BL', 'Approve Final AWB',
  'Upload Draft BL', 'Upload Draft AWB',
  'Upload Final BL & Freight Certificate', 'Upload Final AWB & Freight Certificate',
];

const NEW_TASKS = [
  'Vendor Selection', 'Detention Free Time', 'Confirm CFS Vendor',
  'CFS Gate in Date & Time', 'CFS Destuff Indicator Confirmation', 'CFS Gate out Date & Time', 'CFS Incidental Events',
  'ICD Gate in Date & Time', 'ICD Destuff Indicator Confirmation', 'ICD Gate out Date & Time', 'ICD Incidental Events',
  'Transporter Confirmation', 'Carrier Confirmation', 'Consignment Note & Eway Bill',
  'Empty Container Return Details', 'Transporter Incidental Events',
  'FF Incidental Events', 'CHA Incidental Events',
  'FF Charge Confirmation & Invoicing', 'CHA Charge Confirmation & Invoicing',
  'Enter Package Details', 'Enter Cargo Volume Details', 'Enter Total Weight Details',
  'Cargo Gate in Time', 'Enter Cargo Handover Time', 'Cargo On-board Time',
];

export function resolveTasksForShipment(
  mode: ShipmentMode,
  incoterm: string,
  selectedVendor: 'CFS' | 'ICD' | null,
): ResolvedTask[] {
  const hiddenPersonas = getHiddenPersonasForIncoterm(incoterm);

  return TASK_SEQUENCE
    .filter(entry => {
      // Mode filter: task must exist for this mode
      const taskName = entry.taskByMode[mode];
      if (!taskName) return false;

      // Incoterm filter: hide tasks whose persona is hidden
      if (hiddenPersonas.includes(entry.persona)) return false;

      // CFS/ICD block filter
      if (entry.vendorBlock) {
        if (!selectedVendor) return false;
        if (entry.vendorBlock !== selectedVendor) return false;
      }

      return true;
    })
    .map(entry => ({
      seq: entry.seq,
      name: entry.taskByMode[mode]!,
      assignee: entry.assignee,
      milestone: entry.milestone,
      persona: entry.persona,
      vendorBlock: entry.vendorBlock,
      approved: APPROVED_TASKS.includes(entry.taskByMode[mode]!),
      isNew: NEW_TASKS.includes(entry.taskByMode[mode]!),
      taskKey: `${entry.seq}-${entry.vendorBlock || 'main'}`,
    }));
}
