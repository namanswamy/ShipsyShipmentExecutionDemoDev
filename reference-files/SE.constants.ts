export const MilestoneCodes = {
  ALL: { label: 'All', key: 'ALL', countLabel: 'TOTAL_ACTIVE_COUNT', width: 50 },
  DRAFT: { label: 'Drafts', key: 'DRAFT', countLabel: 'DRAFT', width: 70 },
  AT_ORIGIN: { label: 'Origin', key: 'AT_ORIGIN', countLabel: 'AT_ORIGIN', width: 70 },
  IN_TRANSIT: { label: 'In Transit', key: 'IN_TRANSIT', countLabel: 'IN_TRANSIT', width: 90 },
  TRANSSHIPMENT: { label: 'Transhipment', key: 'TRANSSHIPMENT', countLabel: 'TRANSSHIPMENT', width: 110 },
  DESTINATION: { label: 'Destination', key: 'DESTINATION', width: 100, countLabel: 'DESTINATION' },
  COMPLETED: { label: 'Completed', key: 'COMPLETED', width: 90, countLabel: 'COMPLETED' },
  ON_HOLD: { label: 'On Hold', key: 'ON_HOLD', width: 80, countLabel: 'ON_HOLD' },
  DELETED: { label: 'Deleted', key: 'DELETED', width: 90, countLabel: 'DELETED' },
};

export const ValidMilestoneCodes = {
  AT_ORIGIN: 'AT_ORIGIN',
  DRAFT: 'DRAFT',
  IN_TRANSIT: 'IN_TRANSIT',
  TRANSSHIPMENT: 'TRANSSHIPMENT',
  DESTINATION: 'DESTINATION',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  DELETED: 'DELETED',
};

export const ValidTaskStatusCodes = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  DEADLINE_ELAPSED: 'DEADLINE_ELAPSED',
  DEADLINE_APPROACHING: 'DEADLINE_APPROACHING',
  OPEN: 'OPEN',
};

export const ValidMilestoneAndStatusCodes = {
  ...ValidMilestoneCodes,
  ...ValidTaskStatusCodes,
};

export const SESortOptions = {
  nearest_deadline: 'Nearest Deadline',
  updated_at: 'Last Activity Date',
  created_at: 'Recently Created',
};

export const SEDateFilterOptions = {
  nearestDeadline: 'Nearest Task Deadline',
  updatedAt: 'Last Update',
  createdAt: 'Creation Date',
};

export const RelianceCompanyCodeMapping = [
  { key: 'RJIL', label: 'RJIL' },
  { key: 'RPPMSL', label: 'RPPMSL' },
  { key: 'JPL', label: 'JPL' },
  { key: 'RBL', label: 'RBL' },
];

export const myTaskListStatus = [
  'Done', 'In Progress', 'Cancelled', 'Not Started',
  'Sent For Approval', 'Rejected', 'Amend Task',
];

export const taskResourceTypes = {
  DOCUMENTS: 'DOCUMENTS',
  CONTAINERS: 'CONTAINERS',
  AWBS: 'AWBS',
};

export const sortOrderTypes = {
  ASCENDING: 'ASC',
  DESCENDING: 'DESC',
};

export const seachFilterOptions = [
  { key: 'ALL', label: 'All' },
  { key: 'SHIPMENT #', label: 'Shipment Number' },
  { key: 'BOOKING #', label: 'Booking Number' },
  { key: 'CLIENT REF #', label: 'Client Reference Number' },
  { key: 'SALES ORDER #', label: 'Sales Order Number' },
  { key: 'PURCHASE ORDER #', label: 'Purchase Order Number' },
  { key: 'INVOICE #', label: 'Invoice Number' },
  { key: 'CUSTOM FIELDS', label: 'Custom Fields' },
];

export const bulkUploadTabs = {
  PIC_ASSIGNMENT: 'PIC Assignment',
  CONTAINER_FIELDS: 'Container Fields',
};

export const bulkUpdatesearchFilterOptions = [
  { key: 'CLIENT REF #', label: 'Internal Reference Number' },
  { key: 'SHIPMENT #', label: 'Shipsy Reference Number' },
  { key: 'SALES ORDER #', label: 'SO Number' },
  { key: 'PURCHASE ORDER #', label: 'PO Number' },
];

export const MAX_PIC_ASSIGNMENTS = 10;
