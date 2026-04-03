import moment from 'moment';
import { KeyLabel, Carrier, ProductDetails } from "src/Library/Types";
import { SEDateFilterOptions, SESortOptions, ValidMilestoneAndStatusCodes, ValidMilestoneCodes } from './SE.constants';
import { trackingCardData } from './SE.utils';
import { Country, Ports } from "src/components/common/Types/CommonTypes";
import { BookingOffice } from "../Enquiry/Modals/Booking.types";

export type SEFiltersType = {
  sortBy: keyof typeof SESortOptions;
  sortOrder: string;
  descendingOrder: boolean;
  hideDeleted: boolean;
  polList: KeyLabel[];
  podList: KeyLabel[];
  typeList: string[];
  ffIdList: string[];
  chaIdList: string[];
  transporterIdList: string[];
  customerIdList: string[];
  shipmentIdList: string[];
  carrierCodeList: string[];
  clientReferenceNumberList: string[];
  bookingNumberList: string[];
  dateFilter: keyof typeof SEDateFilterOptions;
  dateRangeFilter: unknown;
  hasTracking: boolean;
  plantIdList: string[];
  milestone: keyof typeof ValidMilestoneCodes | null;
  shipmentId: string;
  shipmentName: string;
  shipmentSearchType: string;
  incotermList: string[];
  companyCodeList: string[];
  modeList: string[];
  myTaskList: string[];
  siInttraStatusList: any;
  poNumberList: string[];
  productKeyList: string[];
  myTaskStatusFilterList: string[];
  myTaskNameFilterList: string[];
  supplierIdList: string[];
};

export type MilestoneCount = {
  [key in keyof typeof ValidMilestoneCodes]: number;
};

export type MilestoneAndStatusCount = {
  [key in keyof typeof ValidMilestoneAndStatusCodes]: number;
};

export type ShipmentSearchDropDown = {
  id: string;
  name: string;
  searchType: string;
  shipmentIdList: string[];
};

export type TaggableUserType = {
  email: string;
  id: string;
  name: string;
  organisationId: string;
  organisationName: string;
  teams: { id: string | null; name: string | null; remark: string | null }[];
  username: string;
};

export type ShipmentExecutionActivityType = {
  content: any;
  createdAt: moment.Moment;
  creator: { id: string; name: string };
  id: string;
  meta: any;
  name: string;
  organisationId: string;
  organisationName: string;
};

export type FetchActivityResponseType = {
  currentPageNumber?: number;
  data: ShipmentExecutionActivityType[];
  isNextPresent?: boolean;
  lastItemIdNext?: string;
  lastItemIdPrev?: string;
  lastSortedColumnValueNext?: string;
  lastSortedColumnValuePrev?: string;
};

export type FetchCommentsRequestBodyType = {
  sourceObjectId: string;
  currentPageNumber: number;
  descendingOrder: boolean;
  lastRowId: string;
  lastSortedColumnValue: string;
  nextOrPrev: 'first' | 'next' | 'prev';
  resultPerPage: number;
  searchQuery: string;
  sortBy: "updated_at";
  userList: (string | undefined)[];
  parentId: string | null;
};

export type ShipmentExecutionCommentType = {
  createdFromEmail: boolean;
  id: string;
  organisationId: string;
  organisationName: string;
  parentId: string;
  rawHtml: string;
  text: string;
  updatedAt: moment.Moment;
  userDetails: {
    email: string;
    id: number;
    name: string;
    organisationId: string;
    userName: string;
  };
};

export type PaginationResponseType = {
  currentPageNumber: number;
  isNextPresent: true;
  lastItemIdNext: string;
  lastItemIdPrev: string;
  lastSortedColumnValueNext: string;
  lastSortedColumnValuePrev: string;
};

export type FetchCommentsResponseType = PaginationResponseType & {
  data: ShipmentExecutionCommentType[] | undefined;
};

export type FetchShipmentActivityDto = {
  queryString?: string;
  userList?: (string | undefined)[];
  typeEventList?: (string | undefined)[];
  descendingOrder: boolean;
  nextOrPrev: string;
  lastSortedColumnValue: string;
  lastActivityId?: string;
  currentPageNumber?: number;
};

export type SETrackingCardData = ReturnType<typeof trackingCardData>;
