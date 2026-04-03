export type SEOrgType = 'SHIPPER' | 'FF';
export type SEInquiryType = 'Export';
export type SEPortType = 'AIR' | 'WET' | 'DRY';
export type SEActionTabsType = 'tasks' | 'documents' | 'details' | 'tracking' | 'documentRequest';
export type TabType = { key: string; label: string; value: string };

export interface SECreateShipmentActions {
  bookingIdChange: ({ bookingId, bookingNumber }: any) => void;
  resetState: () => void;
  setSuperState: (newState: any) => void;
  handleServiceTypeChange: (e: any) => void;
  handleModeChange: (e: any) => void;
  handlePortSearch: (searchFor: any, query: any, type?: string, topFive?: any) => void;
  handleChangeLoadingLocation: (loc: any) => void;
  handleChangeUnloadingLocation: (loc: any) => void;
  handleSearchCustomer: (query: string) => void;
  s3LinkRequest: ({ file }: { file: any }, ind: any) => Promise<void>;
}

export interface SEUserPermissions {
  SHIPMENT_ADD_EDIT: boolean;
  SHIPMENT_DO_ADD_EDIT_SHIPPER: boolean;
  SHIPMENT_DO_ADD_EDIT_VENDOR: boolean;
  SHIPMENT_TASK_ADD_EDIT_SHIPPER: boolean;
  SHIPMENT_TASK_ADD_EDIT_VENDOR: boolean;
}
