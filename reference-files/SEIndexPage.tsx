import React, { useEffect, useState, useRef, useCallback } from 'react';
import Select from 'antd/lib/select';
import Button from 'antd/lib/button';
import Tabs from 'antd/lib/tabs';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import Tag from 'antd/lib/tag';
import Spin from 'antd/lib/spin';
import NotificationButton from 'src/components/pages/Notifications/NotificationsButton';
import {
  getExecutionMISReport, getNotifications, getNotificationsPolling,
  markNotifications, searchShippingApi, getTaskCountByStatusForShipment,
} from 'src/api/shipmentExecution';
import { MIN_WIDTH, MOBILE_BREAK_POINT } from 'src/globals';
import { OrgTypes, EximModules, StakeholderTypes, UserRole } from 'src/Library/Constants';
import MISReportView from 'src/components/common/MISReportView';
import useRouter from 'src/hooks/useRouter';
import SEFilters from './SEFilters';
import { bindActionCreators } from 'redux';
import {
  setPrevPagination, shipmentApplyFilter, shipmentResetFilter,
  shipmentSetFilter, shipmentSetPagination, toggleShipmentWatch, setSelectedShipments,
} from 'src/actions/shipmentExecutionActions';
import { MAX_PIC_ASSIGNMENTS, MilestoneCodes, seachFilterOptions, ValidMilestoneCodes } from './SE.constants';
import { StylesProps, APIResponseType, RouterProps } from 'src/Library/Types';
import { MilestoneCount, SEFiltersType, ShipmentSearchDropDown } from './SE.Types';
import SEActions from './SEActions/SEActions';
import SEShipmentCard from './SEShipmentsList/SEShipmentCard';
import PortIcon from 'src/components/common/icons/PortIcon';
import SearchIcon from 'src/components/common/icons/SearchIcon';
import SimplePaginator from 'src/components/common/SimplePaginator';
import GetExecutionData from 'src/dto/response/getExecution';
import DiscoverRateButton from '../DiscoverRate/DiscoverRateButton';
import NewShipmentForm from './create-shipment/new-shipment';
import { HocOptions } from 'src/components/hoc/GenericHoc.types';
import GenericHoc from 'src/components/hoc/GenericHoc';
import Loader from 'src/components/common/Loader';
import Menu from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';
import SEBulkShipment from './SEBulkShipment/SEBulkShipment';
import Navbar from 'src/components/navbar/Navbar';
import BulkRequestProgressPopup from '../../common/BulkRequestProgressPopup';
import SEBulkUpdate from './SEBulkUpdate';
import { REQUEST_STATUS } from '../BulkRequest/BulkRequestUtils';
import { Checkbox, message } from 'antd';
import SEBulkUpdateModal from './SEBulkUpdateModal';
import { getShipmentExecutionFFRoute, getShipmentExecutionShipperRoute } from 'src/routing/utils';
import SEBulkDelete from './SEBulkDelete';

const ShipsySupportUrl = 'https://shipsy-help.freshdesk.com/support/home';

const styles = () => ({
  [`@media (max-width: ${MOBILE_BREAK_POINT}px)`]: {
    mainDiv: { display: 'inline-block' },
  },
  mainDiv: {
    minWidth: MIN_WIDTH, overflowY: 'hidden', height: '100%', backgroundColor: '#F1EEE7',
  },
  anchor: { color: '#1890FF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
  reportsShipmentButton: { marginLeft: 30, display: 'flex', gap: '10px' },
  filterBoxContents: {
    background: 'rgba(255, 255, 255, .9)', height: 60,
    padding: '0px 24px 0px 18px', display: 'flex', width: '100%',
    justifyContent: 'space-between', alignItems: 'center',
    overflowX: 'auto', overflowY: 'hidden', minWidth: 0,
    '&::-webkit-scrollbar': { height: '4px' },
  },
  bodyBackground: { backgroundColor: '#F1EEE7' },
  bodyContent: { margin: '0px 10px 0px 10px' },
  status: {
    padding: '12px 8px 0 12px', paddingTop: 10, width: '100%',
    display: 'flex', justifyContent: 'space-between',
  },
  shipmentList: {
    marginTop: 10, width: '37.6%', maxHeight: 'calc(100vh - 170px)',
    overflowY: 'auto', paddingBottom: 100,
  },
  shipmentActions: {
    marginTop: 10, marginLeft: 10, width: '62.3%', height: 'fit-content',
  },
  reportsButton: {
    background: 'transparent', border: '1px solid #999999', color: '#111111',
    borderRadius: '4px', marginRight: '10px', fontSize: 12, height: 28,
  },
  showBulkUploadModel: {
    background: 'transparent', border: '1px solid #999999', color: '#111111',
    borderRadius: '4px', marginRight: '10px', fontSize: 12, height: 28,
  },
  newButton: {
    height: 28, borderRadius: '4px', fontSize: 12,
    backgroundColor: '#006EC3 !important', border: '1px solid #006EC3',
  },
  search: {
    '& .ant-select-selection--single': { borderRadius: '0px 4px 4px 0px' },
    '& .ant-select-selection--multiple .ant-select-selection__clear': {
      marginRight: '10px', width: '400px', borderRadius: '0 4px 4px 0',
      height: '100%', overflowY: 'scroll',
    },
    marginRight: -20, width: '200px', height: '30px',
    '& .ant-select-selection__placeholder': { fontSize: '13px !important' },
  },
  rightTools: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  filterLabel: {
    margin: '0px 10px 0px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center',
  },
  filterForMoreFilters: { padding: '0px 10px 0 3px', fontSize: 12, fontWeight: 700 },
  searchTypeFilter: {
    width: '120px',
    '& .ant-select-selection--single': { borderRadius: '4px 0px 0px 4px' },
  },
  bulkActionBox: {
    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#ffffff', padding: '10px 15px', marginBottom: '5px',
    fontSize: '12px', fontWeight: '600',
  },
});

interface SEIndexPageProps extends StylesProps<ReturnType<typeof styles>>, RouterProps {
  tkey: string;
  orgType: string;
  showDiscoverSellRates: boolean;
  showDiscoverBuyRates: boolean;
  type: string;
  modules: any;
  permissions: any;
  isLoading: boolean;
  appliedFilters: SEFiltersType;
  validMilestoneCodes: typeof ValidMilestoneCodes;
  milestoneCount: MilestoneCount;
  applyFilter: () => void;
  setFilter: (arg: Partial<SEFiltersType> | null) => void;
  setPrevPagination: () => void;
  resetFilter: () => void;
  shipmentData: any;
  pagination: any;
  setPagination: (any) => void;
  userEmail: string;
  toggleShipmentWatch: (params) => void;
  updateTaskSummary: boolean;
  shippingLines: any;
  odexVgmReferenceNumber: any;
  allowContainerTaskBulkUpload?: boolean;
  disableSingleShipmentExecutionCreation?: boolean;
  selectedShipments: Record<string, GetExecutionData>;
  setSelectedShipments: (selectedShipments: Record<string, GetExecutionData>) => void;
  userRole: UserRole;
  organisationId: string;
  isParentOrg: boolean;
  stakeholderAccountType?: string | null;
}

let searchFilterValue;

const SEIndexPage = (props: SEIndexPageProps) => {
  const {
    classes, tkey, orgType, showDiscoverSellRates, showDiscoverBuyRates, type,
    modules, permissions, shipmentData, isLoading, appliedFilters, milestoneCount,
    userEmail, toggleShipmentWatch, resetFilter, pagination, updateTaskSummary,
    allowContainerTaskBulkUpload, disableSingleShipmentExecutionCreation,
    match, history, selectedShipments, setSelectedShipments, userRole,
  } = props;

  const { location } = useRouter();
  const showDiscoverRates = showDiscoverSellRates || showDiscoverBuyRates;

  const [state, setState] = useState<any>(undefined);
  const [isMISVisible, setIsMISVisible] = useState<boolean>(false);
  const [dropdown, setDropdown] = useState<ShipmentSearchDropDown[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedShipment, setSelectedShipment] = useState<GetExecutionData | {}>({});
  const [newShipment, setNewShipment] = useState<boolean>(false);
  const [showBulkUploadModel, setShowBulkUploadModel] = useState<boolean>(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<GetExecutionData> | undefined>();
  const [disableBooking, setDisableBooking] = useState<boolean>(false);
  const [ctOrBooking, setCTOrBooking] = useState<string | undefined>();
  const [isMultipleUploadVisible, setIsMultipleUploadVisible] = useState(false);
  const [uploadRequest, setUploadRequest] = useState();
  const [updateRequest, setUpdateRequest] = useState<undefined | {
    fileName: string; id: string | number; status: REQUEST_STATUS;
  }>(undefined);
  const [searchType, setSearchType] = useState('ALL');
  const [loadSelectedShipments, setLoadSelectedShipments] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const searchInputFilterGroupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<any>(null);
  const currentRequestId = useRef<number>(0);
  const currentAbortController = useRef<AbortController | null>(null);

  const { taskSummaries } = state || {};

  useEffect(() => {
    componentDidMount();
    document.addEventListener('click', handleClickOutside, false);
    return () => { document.removeEventListener('click', handleClickOutside, false); };
  }, []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current && !match?.params?.shipmentId) {
      searchInputRef?.current.focus();
      searchInputRef?.current.rcSelect?.setOpenState(true, true);
    }
  }, [searchType, isSearchExpanded]);

  const fetchTaskSummaries = useCallback(async () => {
    if (!shipmentData || !Object.keys(shipmentData).length) return;
    const shipmentIdList = shipmentData.map((el) => el.id);
    const response: APIResponseType<
      { sourceObjectId: string; status: string; count: number }[]
    > = await getTaskCountByStatusForShipment({ shipmentIdList });
    const taskSummaries =
      response.data?.length &&
      response.data.reduce((acc, cur) => {
        if (!acc[cur.sourceObjectId]) acc[cur.sourceObjectId] = {};
        acc[cur.sourceObjectId][cur.status] = cur.count;
        return acc;
      }, {});
    setState({ taskSummaries });
  }, [shipmentData]);

  useEffect(() => { fetchTaskSummaries(); }, [pagination, updateTaskSummary, fetchTaskSummaries]);

  useEffect(() => {
    const { state } = location || {};
    if (state?.createShipment) { handleNewShipment(false); }
  }, [location.pathname]);

  const handleMultipleShipment = () => { setIsMultipleUploadVisible(!isMultipleUploadVisible); };

  const newShipmentMenu = () => {
    const isBulkDisabled = props.stakeholderAccountType === StakeholderTypes.CUSTOMER;
    return (
      <Menu>
        {disableSingleShipmentExecutionCreation ? <div /> : (
          <Menu.Item onClick={() => setNewShipment(true)}>Single Shipment</Menu.Item>
        )}
        {!isBulkDisabled && <Menu.Item onClick={handleMultipleShipment}>Multiple Shipments</Menu.Item>}
      </Menu>
    );
  };

  const handleNewShipment = (newForm = true) => {
    const { state } = location || {};
    setNewShipment(true);
    if (!newForm) {
      let seFrom;
      if (state?.fromTnt) seFrom = EximModules.CT;
      else if (state?.fromBooking) seFrom = EximModules.BOOKING;
      setCTOrBooking(seFrom);
      setEditData({
        ...(state?.data || {}),
        bookingReferenceNumber: state?.data.bookingNumber,
        sourceObjectId: state?.sourceObjectId,
        sourceObjectType: state?.sourceObjectType,
      });
      setDisableBooking(state?.disableBooking);
    }
  };

  useEffect(() => {
    if (!shipmentData?.length) return;
    setSelectedShipment(shipmentData[0]);
  }, [appliedFilters, pagination]);

  const componentDidMount = async () => {
    const { state } = location || {};
    if (state?.shipmentId) {
      handleShipmentSearch(state?.shipmentId);
      handleShipmentChange(state?.shipmentId, {
        props: { shipmentIdList: [state?.shipmentId] },
      });
      return;
    }
    const { shipmentId, shipmentNumber } = match?.params || {};
    if (shipmentId && shipmentNumber) {
      setIsSearchExpanded(true);
      handleShipmentChange(shipmentId, {
        props: { shipmentId, shipmentIdList: [shipmentId], name: shipmentNumber, shipmentSearchType: 'SHIPMENT #' },
      });
      return;
    }
    const { setPrevPagination, resetFilter } = props;
    const shouldKeepFilters = location?.state?.shouldKeepFilters || false;
    if (shouldKeepFilters) await setPrevPagination();
    else await resetFilter();
  };

  let timeout: any = null;
  const handleShipmentSearch = (val) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => { searchShipment(val); }, 500);
  };

  const searchShipment = async (search) => {
    currentRequestId.current += 1;
    const requestId = currentRequestId.current;
    if (currentAbortController.current) currentAbortController.current.abort();
    currentAbortController.current = new AbortController();
    setDropdown([]);
    setIsSearching(true);
    const apiCallObject = {
      queryString: search ? search.trim() : search,
      viewType: type === 'SHIPPER' ? 'SHIPPER' : 'VENDOR',
      searchType: searchType === 'ALL' ? undefined : searchType,
    };
    try {
      const response = await searchShippingApi(apiCallObject, currentAbortController.current.signal);
      if (requestId === currentRequestId.current) {
        if (response.isSuccess) setDropdown(response.data);
      }
    } catch (error) {
      if (error && !(error.name === 'AbortError' || error.code === 'ERR_CANCELED' || error.message === 'canceled')) {
        console.error('Error fetching shipment search results:', error);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSoftRefresh = async () => {
    setIsRefreshing(true);
    try { await props.applyFilter(); }
    catch (error) { }
    finally { setIsRefreshing(false); }
  };

  const renderHelpButton = () => {
    return tkey === 'SHIPMENT' ? (
      <a className={classes.anchor} onClick={() => window.open(ShipsySupportUrl, '_blank')}>Help</a>
    ) : null;
  };

  const renderNotificationsButton = () => (
    <NotificationButton
      styles={{ marginLeft: 25 }} type={orgType}
      notifApi={getNotifications} markApi={markNotifications}
      pollingApi={getNotificationsPolling} currentModule={'SHIPMENT'}
    />
  );

  const isNewShipmentButtonVisible = () => {
    return modules?.show_shipment_execution_shipper
      && type === OrgTypes.SHIPPER
      && permissions?.SHIPMENT_ADD_EDIT;
  };

  const renderNewShipmentButton = () => {
    if (!isNewShipmentButtonVisible()) return;
    return (
      <Dropdown overlay={newShipmentMenu()}>
        <Button type="primary" className={classes.newButton}>New Shipment</Button>
      </Dropdown>
    );
  };

  const renderBulkShipmentModal = () => {
    if (!isMultipleUploadVisible) return null;
    return (
      <SEBulkShipment
        isVisible={isMultipleUploadVisible}
        onClose={(isReload) => isReload ? componentDidMount() : handleMultipleShipment()}
        getRequestObject={(request) => setUploadRequest(request)}
      />
    );
  };

  const renderModals = () => (
    <>
      {renderBulkDeleteModal()}
      {renderBulkShipmentModal()}
      {renderBulkUpdateModal()}
      <BulkRequestProgressPopup newRequest={uploadRequest} reloadShipments={() => resetFilter()} />
      <BulkRequestProgressPopup newRequest={updateRequest} reloadShipments={() => resetFilter()} />
    </>
  );

  const onClickSearchIcon = (event) => { setIsSearchExpanded(true); };

  const handleClickOutside = (e) => {
    if (
      searchFilterValue ||
      e?.target?.closest('#searchTypeFilter') ||
      e?.target?.closest('#searchFilterIcon') ||
      e?.target?.closest('[data-icon]')?.getAttribute('data-icon') === 'search' ||
      e?.target?.closest('.ant-select-dropdown-menu-item-selected') ||
      e?.target?.closest('.ant-tooltip-open') ||
      e?.target?.closest('path') ||
      e?.target?.closest('svg')
    ) return;
    if (searchInputFilterGroupRef.current && !searchInputFilterGroupRef?.current?.contains(e?.target)) {
      setIsSearchExpanded(false);
    }
  };

  const handleShipmentChange = (search, option) => {
    const { setFilter, applyFilter } = props;
    if (search) {
      searchFilterValue = option?.props?.name;
      setFilter({
        shipmentIdList: option.props?.shipmentIdList,
        shipmentName: option.props?.name,
        shipmentSearchType: option.props?.searchType,
        shipmentId: option.props?.id,
      });
    } else {
      if (match?.params?.shipmentId) {
        type === OrgTypes.SHIPPER
          ? history.push(getShipmentExecutionShipperRoute())
          : history.push(getShipmentExecutionFFRoute());
      }
      searchFilterValue = undefined;
      setFilter({
        shipmentIdList: [], shipmentName: undefined,
        shipmentSearchType: undefined, shipmentId: undefined,
      });
    }
    applyFilter();
  };

  const handleShipmentSearchType = (value) => {
    setSearchType(value);
    setDropdown([]);
  };

  const renderSearch = () => {
    const { appliedFilters } = props;
    return (
      <div style={{ fontSize: 20, cursor: 'pointer' }}>
        {isSearchExpanded ? (
          <div style={{ display: 'flex', marginTop: '-4px' }} ref={searchInputFilterGroupRef}>
            <Select
              mode="default" onChange={handleShipmentSearchType}
              dropdownMatchSelectWidth={false} defaultValue={searchType}
              className={classes.searchTypeFilter} id={'searchTypeFilter'}
            >
              {seachFilterOptions.map((item) => (
                <Select.Option key={item.key} value={item.key} data-search-type-code={item.key}>
                  <Tooltip title={item.label} placement={'left'}>{item.label}</Tooltip>
                </Select.Option>
              ))}
            </Select>
            <Select
              getPopupContainer={(trigger: any) => trigger.parentNode}
              showSearch allowClear dropdownMatchSelectWidth={false}
              filterOption={() => true}
              notFoundContent={isSearching ? <div style={{ padding: '25px' }}><Spin /></div> : 'Not Found'}
              suffixIcon={<Icon type="search" />}
              className={classes.search} placeholder={'Search'}
              value={searchFilterValue}
              onFocus={() => handleShipmentSearch(searchFilterValue)}
              onChange={handleShipmentChange}
              onSearch={handleShipmentSearch}
              dropdownMenuStyle={{ width: '300px' }}
              optionLabelProp={'data-value'}
              ref={searchInputRef}
              style={{ width: type !== 'SHIPPER' ? '300px' : '200px' }}
            >
              {dropdown && dropdown.map((item: any) => (
                <Select.Option {...item} key={item.id} data-value={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <span></span>
                    <Tag color="cyan">{item.searchType}</Tag>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
        ) : (
          <div id={'searchFilterIcon'}>
            <Icon type="search" onClick={(ev) => onClickSearchIcon(ev)} />
          </div>
        )}
      </div>
    );
  };

  const setMilestoneFilter = (milestone: keyof typeof ValidMilestoneCodes | null) => {
    const { setFilter, applyFilter, validMilestoneCodes } = props;
    if (milestone !== null && validMilestoneCodes?.hasOwnProperty(milestone))
      setFilter({ milestone });
    else setFilter({ milestone: null });
    if (milestone === ValidMilestoneCodes.DELETED) setFilter({ hideDeleted: false });
    else setFilter({ hideDeleted: true });
    applyFilter();
  };

  const getCount = (code) => {
    if (isLoading) return <span className={'loadingDotsBlue'}></span>;
    const count = milestoneCount?.[MilestoneCodes[code].countLabel];
    if (!count) return '0';
    return count > 999 ? '999+' : count;
  };

  const renderTabContent = (code: keyof typeof MilestoneCodes) => (
    <span style={{ display: 'flex', alignItems: 'center', width: MilestoneCodes[code].width, height: 32 }}
      data-filter-milestone={MilestoneCodes[code].key}>
      {MilestoneCodes[code].label}
      <div style={{ marginLeft: 10 }}>{getCount(code)}</div>
    </span>
  );

  const renderMilestoneFilters = () => (
    <Tabs style={{ height: 32 }} type="card" tabBarGutter={-1} tabBarStyle={{ marginBottom: '0px' }}
      onChange={(key: keyof typeof ValidMilestoneCodes) => setMilestoneFilter(key)}
      activeKey={appliedFilters.milestone || 'ALL'}>
      {Object.keys(MilestoneCodes).map((code: keyof typeof MilestoneCodes) => (
        <Tabs.TabPane disabled={isLoading} tab={renderTabContent(code)} key={MilestoneCodes[code].key} />
      ))}
    </Tabs>
  );

  const getAppliedFiltersCount = () => {
    const { appliedFilters } = props;
    const polApplied = appliedFilters?.polList?.length ? 1 : 0;
    const podApplied = appliedFilters?.podList?.length ? 1 : 0;
    const typeApplied = appliedFilters?.typeList?.length ? 1 : 0;
    const ffApplied = appliedFilters?.ffIdList?.length ? 1 : 0;
    const chaApplied = appliedFilters?.chaIdList?.length ? 1 : 0;
    const customerApplied = appliedFilters?.customerIdList?.length ? 1 : 0;
    const dateApplied = appliedFilters.dateRangeFilter ? 1 : 0;
    const hasTrackingApplied = appliedFilters?.hasTracking ? 1 : 0;
    const carrierCodeApplied = appliedFilters?.carrierCodeList?.length ? 1 : 0;
    const plantApplied = appliedFilters?.plantIdList?.length ? 1 : 0;
    return polApplied + podApplied + ffApplied + typeApplied + chaApplied +
      customerApplied + dateApplied + hasTrackingApplied + carrierCodeApplied + plantApplied;
  };

  const renderNoData = () => {
    const content = getAppliedFiltersCount() === 0 ? (
      <>
        <div style={{ color: '#666666', fontWeight: 'bold', paddingTop: 10, fontSize: 21 }}>No Shipments to show</div>
        {isNewShipmentButtonVisible() && (
          <div style={{ color: '#666666', fontWeight: 500, paddingTop: 10, fontSize: 21 }}>
            To get started, <span onClick={() => setNewShipment(true)} style={{ color: '#1890FF', cursor: 'pointer' }}>Add New Shipment</span>
          </div>
        )}
      </>
    ) : (
      <>
        <div style={{ color: '#666666', fontWeight: 'bold', paddingTop: 10, fontSize: 21 }}>No Shipments to show</div>
        <div style={{ color: '#666666', fontWeight: 500, paddingTop: 10, fontSize: 21 }}>Try adjusting the filters.</div>
      </>
    );
    return (
      <div className={classes.notFound}>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: '8%' }}>
          <div className={classes.notFoundItems}>
            {getAppliedFiltersCount() === 0
              ? <PortIcon className={classes.blackIcon} width="184" height="184" />
              : <SearchIcon className={classes.blackIcon} width="184" height="184" />}
          </div>
          {content}
        </div>
      </div>
    );
  };

  const handleFirstPageClick = () => { resetFilter(); };
  const handlePrevClick = () => {
    props.setPagination({ currentPageNumber: props.pagination.currentPageNumber, nextOrPrev: 'prev' });
  };
  const handleNextClick = () => {
    props.setPagination({ currentPageNumber: props.pagination.currentPageNumber, nextOrPrev: 'next' });
  };

  const renderPagination = () => {
    const { isLoading, pagination } = props;
    return (
      <div style={{ display: 'flex', marginLeft: '7%' }}>
        <SimplePaginator
          loading={isLoading} isNext={pagination.isNextPresent}
          onFirstClick={handleFirstPageClick}
          onPrevClick={() => handlePrevClick()}
          onNextClick={() => handleNextClick()}
          pageNumber={pagination.currentPageNumber}
        />
        <div style={{ margin: '0px 16px' }}>
          <Select value={`${pagination.resultPerPage} / page`} disabled={isLoading}
            onChange={(resultPerPage) => {
              if (resultPerPage !== pagination.resultPerPage) props.setPagination({ resultPerPage });
            }}>
            <Select.Option key={'10'}> 10 / page</Select.Option>
            <Select.Option key={'25'}> 25 / page</Select.Option>
            <Select.Option key={'50'}> 50 / page</Select.Option>
            <Select.Option key={'100'}>100 / page</Select.Option>
          </Select>
        </div>
      </div>
    );
  };

  const handleCreateShipment = (success) => {
    setNewShipment(false);
    if (success) { props.applyFilter(); searchFilterValue = undefined; }
    setEditData(undefined); setCTOrBooking(undefined); setDisableBooking(false);
  };

  const renderNewShipment = () => {
    if (!newShipment) return null;
    return <NewShipmentForm handleClose={(success) => handleCreateShipment(success)}
      editData={editData} disableBooking={disableBooking} ctOrBooking={ctOrBooking} />;
  };

  const showBulkUpdateModal = (loadSelectedShipments: boolean) => {
    if (Object.keys(selectedShipments).length > MAX_PIC_ASSIGNMENTS && loadSelectedShipments) {
      message.error(`You can bulk update a maximum of ${MAX_PIC_ASSIGNMENTS} shipments at a time`);
    } else {
      setLoadSelectedShipments(loadSelectedShipments);
      setShowBulkUploadModel(true);
    }
  };

  const renderBulkUpdateButton = () => {
    if (!allowContainerTaskBulkUpload) return;
    return (
      <Button className={classes.reportsButton} onClick={() => showBulkUpdateModal(false)}>Bulk Update</Button>
    );
  };

  const handleBulkModalBackClick = (isSuccess: boolean) => {
    if (isSuccess) { setSelectedShipments({}); props.applyFilter(); }
    setShowBulkUploadModel(false);
  };

  const renderBulkUpdateModal = React.useCallback(() => {
    if (!showBulkUploadModel) return;
    return (
      <SEBulkUpdateModal
        onBack={({ isSuccess = false }) => handleBulkModalBackClick(isSuccess)}
        type={type} getRequestObject={(params) => setUpdateRequest(params)}
        SelectedShipments={setSelectedShipments} loadSelectedShipments={loadSelectedShipments}
      />
    );
  }, [showBulkUploadModel]);

  const renderBulkDeleteModal = React.useCallback(() => {
    if (!showBulkDeleteModal) return;
    return (
      <SEBulkDelete
        showBulkDeleteModal={showBulkDeleteModal}
        setShowBulkDeleteModal={setShowBulkDeleteModal}
        selectedShipments={selectedShipments}
        onBack={({ isSuccess = false }) => { if (isSuccess) setSelectedShipments({}); setShowBulkDeleteModal(false); }}
        resetFilters={resetFilter}
      />
    );
  }, [showBulkDeleteModal]);

  const renderNavbar = () => <Navbar pageTitle="Manage Tasks" defaultNotificationTab={'SHIPMENT'} />;

  const renderFixedHeader = () => (
    <React.Fragment>
      <div className={classes.filterBoxContents}>
        <SEFilters {...props} isMoreFiltersVisible={!isSearchExpanded} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ fontSize: 20, cursor: 'pointer', marginRight: 16 }} id={'refreshIcon'}>
            <Icon type="reload" onClick={handleSoftRefresh} spin={isRefreshing} style={{ fontSize: 20 }} />
          </div>
          {renderSearch()}
          {type === OrgTypes.SHIPPER && (
            <div className={classes.reportsShipmentButton}>
              <Button className={classes.reportsButton} onClick={() => setIsMISVisible(true)}>Reports</Button>
              {renderNewShipmentButton()}
            </div>
          )}
        </div>
      </div>
      <div className={classes.status}>
        {renderMilestoneFilters()}
        {renderBulkUpdateButton()}
        {renderPagination()}
      </div>
    </React.Fragment>
  );

  const showEdit = (details) => { setNewShipment(true); setEditData(details); setDisableBooking(false); };

  const renderRightSide = () => (
    <div className={classes.shipmentActions} id={'shipment-card-details'}>
      <SEActions
        resetFilters={resetFilter} {...props} selectedShipment={selectedShipment}
        showEdit={showEdit} shippingLines={props.shippingLines}
        odexVgmReferenceNumber={props.odexVgmReferenceNumber}
        actionVisible={match?.params?.action}
      />
    </div>
  );

  const handleSelectAllShipments = (isSelected: boolean) => {
    if (isSelected) {
      const newSelections = {};
      shipmentData.forEach((shipment) => { newSelections[shipment.id] = shipment; });
      setSelectedShipments(newSelections);
    } else { setSelectedShipments({}); }
  };

  const renderSelectAll = () => (
    <div>
      <Checkbox checked={Object.keys(selectedShipments).length === shipmentData.length}
        onChange={(e) => handleSelectAllShipments(e.target.checked)} />
      <span style={{ marginLeft: '10px' }}>Select All</span>
    </div>
  );

  const renderBulkUpdateIcons = () => {
    const isDeletedShipmentSelected = Object.values(selectedShipments).some(
      (shipment) => shipment.milestone === ValidMilestoneCodes.DELETED
    );
    const areAllOwnShipments = props.isParentOrg
      ? Object.values(selectedShipments).every((shipment) => shipment.shipperId === props.organisationId)
      : true;
    const isDisabled = !areAllOwnShipments || isDeletedShipmentSelected;
    return (
      <div>
        <span style={{ margin: '0 10px' }}>
          {Object.keys(selectedShipments).length} Shipment{Object.keys(selectedShipments).length > 1 ? 's' : ''} selected
        </span>
        <Tooltip title={isDeletedShipmentSelected ? '' : 'Update'}>
          <Icon type="edit" style={{ marginRight: '10px', color: isDisabled ? '#ccc' : '#000000' }}
            onClick={() => { if (!isDisabled) showBulkUpdateModal(true); }} />
        </Tooltip>
        {permissions?.SHIPMENT_ADD_EDIT && orgType === OrgTypes.SHIPPER && (
          <Tooltip title={isDeletedShipmentSelected ? '' : 'Delete'}>
            <Icon type="delete" style={{ color: isDeletedShipmentSelected ? '#ccc' : '#E75656' }}
              onClick={() => { if (!isDeletedShipmentSelected) setShowBulkDeleteModal(true); }} />
          </Tooltip>
        )}
      </div>
    );
  };

  const renderBulkActionsHeader = () => (
    <div className={classes.bulkActionBox}>
      {renderSelectAll()}
      {renderBulkUpdateIcons()}
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <Loader zIndex={10} />;
    if (!shipmentData?.length) return renderNoData();
    return (
      <div className={classes.bodyBackground}>
        <div className={classes.bodyContent}>
          <hr style={{ border: 'none', borderTop: '1px double #D2D2D2', color: '#D2D2D2', marginTop: -1 }} />
          <div style={{ display: 'flex', marginTop: -7 }}>
            <div className={classes.shipmentList} id={'shipment-card-list'}>
              {Object.keys(selectedShipments)?.length > 0 && renderBulkActionsHeader()}
              {shipmentData.map((el, index) => (
                <SEShipmentCard
                  userEmail={userEmail}
                  taskSummary={taskSummaries && taskSummaries[el.id]}
                  cardData={el} onClickCard={() => setSelectedShipment({ ...el, index })}
                  selectedShipment={selectedShipment}
                  toggleShipmentWatch={toggleShipmentWatch}
                  index={index} key={el.id}
                  onTrackingModalOpen={() => setState({ isTrackingModalVisible: true, trackingData: el })}
                  type={type}
                />
              ))}
            </div>
            {renderRightSide()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={classes.mainDiv}>
      {renderNavbar()}
      {isMISVisible ? (
        <div className={classes.outerBox}>
          <MISReportView
            getDashboardUrl={async () => { const response = await getExecutionMISReport(); return response?.data?.dashboardUrl; }}
            onBack={() => setIsMISVisible(false)}
          />
        </div>
      ) : (
        <div>
          {renderFixedHeader()}
          {renderContent()}
        </div>
      )}
      {renderNewShipment()}
      {renderModals()}
    </div>
  );
};

const mapStateToProps = ({ shipmentExecutionReducer, masterData }) => ({
  updateTaskSummary: shipmentExecutionReducer.updateTaskSummary,
  shipmentData: shipmentExecutionReducer.shipmentData,
  orgType: masterData.userData.type,
  modules: masterData.modules,
  showDiscoverBuyRates: masterData.modules?.show_discover_buy_rates,
  showDiscoverSellRates: masterData.modules?.show_discover_sell_rates,
  permissions: masterData.permissions,
  isLoading: shipmentExecutionReducer.isLoading,
  appliedFilters: shipmentExecutionReducer.appliedFilters,
  validMilestoneCodes: masterData.execution?.milestoneCodes,
  disableSingleShipmentExecutionCreation: masterData.execution?.disableSingleShipmentExecutionCreation,
  milestoneCount: shipmentExecutionReducer.milestoneCount,
  pagination: shipmentExecutionReducer.pagination,
  userEmail: masterData?.userData?.email,
  shippingLines: masterData?.globalShippingLines,
  odexVgmReferenceNumber: masterData.odexVgmReferenceNumber,
  allowContainerTaskBulkUpload: masterData?.execution?.allowContainerTaskBulkUpload,
  selectedShipments: shipmentExecutionReducer.selectedShipments,
  userRole: masterData.userData.role,
  organisationId: masterData.userData.organisation_id,
  isParentOrg: masterData?.isParentOrg,
  stakeholderAccountType: masterData?.stakeholderAccountType,
});

const mapDispatchToProps = (dispatch, ownProps) => bindActionCreators({
  resetFilter: shipmentResetFilter(ownProps.type),
  setPagination: shipmentSetPagination(ownProps.type),
  setFilter: shipmentSetFilter,
  applyFilter: shipmentApplyFilter(ownProps.type),
  setPrevPagination: setPrevPagination(ownProps.type),
  toggleShipmentWatch, setSelectedShipments,
}, dispatch);

const options: HocOptions = {
  connectRedux: { useRedux: true, mapStateToProps, mapDispatchToProps },
  connectJss: { useJss: true, styleSheet: styles },
  connectRouter: true,
  useInquiryMasterData: true,
  ignoreWithAuth: process.env.NODE_ENV === 'test',
};

const SEEntry = GenericHoc(options)(SEIndexPage);
export default SEEntry;
