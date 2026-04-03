export interface FetchShipmentTasksData {
  AT_ORIGIN: MILESTONE;
  DRAFT: MILESTONE;
  IN_TRANSIT: MILESTONE;
  TRANSSHIPMENT: MILESTONE;
  DESTINATION: MILESTONE;
  COMPLETED: MILESTONE;
  ON_HOLD: MILESTONE;
  DELETED: MILESTONE;
}

interface MILESTONE {
  tasks: SETask[];
  done: number;
  total: number;
  overdueTaskCount: number;
}

export interface SETask {
  isStatusChangeAllowed: boolean;
  id: string;
  name: string;
  responsibleOrganisationId: string;
  responsibleUserId?: any;
  responsibleTeamId?: any;
  responsibleUserName?: any;
  responsibleTeamName?: any;
  status: 'Done' | 'In Progress' | 'Not Started' | 'Cancelled' | 'Sent For Approval';
  remark?: any;
  detailsPlaceholder?: any;
  deadline?: any;
  description?: string;
  organisationId: string;
  updatedAt: number;
  dependentOn?: any;
  dependencyType?: any;
  deadlineDelta?: any;
  sequenceNumber: number;
  workingHoursOnly: boolean;
  taskTemplateId: string;
  type: string;
  subType: string;
  milestone: string;
  watcherList?: any;
  approvalStatus?: any;
  rejectionReasons?: any;
  mainTaskId?: any;
  isWatching: boolean;
  isSailingDateSelected: number;
  isBidSelected?: number;
  responsibleOrganisationName: string;
  isEditable: boolean;
  disabled: boolean;
  isVgmTask: boolean;
  isForm13Task: boolean;
  isUploadSiTask: boolean;
  isAmendmentAllowed: boolean;
  code: string;
}
