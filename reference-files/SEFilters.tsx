import React, { useState, useEffect } from 'react';
import SEMoreFiltersDrawer from './SEMoreFiltersDrawer';
import { modeOptions, myTaskOptions, typeOptions, sortByOptions, InquiryModes, ModesOfService } from 'src/Library/Constants';
import Button from 'antd/lib/button';
import { MilestoneAndStatusCount, SEFiltersType } from './SE.Types';
import { bindActionCreators } from 'redux';
import { PaginationActions, RouterProps, StylesProps } from 'src/Library/Types';
const FCLIcon = require('src/assets/images/FCL.svg');
const LCLIcon = require('src/assets/images/LCL.svg');
const AirIcon = require('src/assets/images/Air.svg');
const filterIcon = require('src/assets/images/filter.svg');
const FCLWhiteIcon = require('src/assets/images/FCLWhite.svg');
const LCLWhiteIcon = require('src/assets/images/LCLWhite.svg');
const AirWhiteIcon = require('src/assets/images/AirWhite.svg');
const filterBlueIcon = require('src/assets/images/filterBlue.svg');
import {
  cancelFilter, fetchAllShipment, setPrevPagination,
  shipmentApplyFilter, shipmentResetFilter, shipmentResetMoreFilter,
  shipmentSetFilter, shipmentSetPagination,
} from 'src/actions/shipmentExecutionActions';
import { SEFiltersStyles } from './SEFilters.styles';
import GenericHoc from 'src/components/hoc/GenericHoc';
import { HocOptions } from 'src/components/hoc/GenericHoc.types';
import { isOrgReliance } from 'src/api/utils';
import { isValidArray } from 'src/Library/Helper';
import { Dropdown, Icon, Input, Menu, Select, Tooltip } from 'antd';
import DomesticTruckIcon from 'src/components/common/icons/DomesticTruckIcon';
import { ValidMilestoneAndStatusCodes, sortOrderTypes } from './SE.constants';

interface SEFiltersProps extends
  StylesProps<ReturnType<typeof SEFiltersStyles>>,
  PaginationActions,
  RouterProps {
  tkey: string;
  orgType: string;
  showDiscoverSellRates: boolean;
  showDiscoverBuyRates: boolean;
  type: string;
  modules: any;
  permissions: any;
  appliedFilters: SEFiltersType;
  applyDefaultTaskStatusFilter?: boolean;
  resetMoreFilter: () => void;
  isMoreFiltersVisible: boolean;
  companyFilter: string[];
  milestoneCount: MilestoneAndStatusCount;
}

const SEFilters: React.FC<SEFiltersProps> = ({
  type, classes, setFilter, resetFilter, applyFilter, appliedFilters,
  applyDefaultTaskStatusFilter, resetMoreFilter, isMoreFiltersVisible,
  companyFilter, milestoneCount, modules,
}) => {
  const [showMoreFiltersDrawer, setShowMoreFiltersDrawer] = useState<boolean>(false);
  const { modeList, myTaskList, typeList, companyCodeList, myTaskStatusFilterList } = appliedFilters;
  const [hasAppliedDefaultFilter, setHasAppliedDefaultFilter] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleOnClickModeFilter = (key: string) => {
    let selModes: string[];
    if (modeList.includes(key)) {
      selModes = modeList.filter(item => item !== key);
    } else {
      selModes = [...modeList, key];
    }
    setFilter({ modeList: selModes });
    applyFilter();
  };

  const handleOnClickTypeFilter = (key) => {
    let selTypes: string[];
    if (typeList?.includes(key)) {
      selTypes = typeList.filter(item => item !== key);
    } else {
      selTypes = [...typeList, key];
    }
    setFilter({ typeList: selTypes });
    applyFilter();
  };

  const handleOnClickMyTaskFilter = (value, isClear = false) => {
    let keys = myTaskStatusFilterList?.length && !isClear ? [...myTaskStatusFilterList] : [];
    if (!isClear && value?.key && keys?.includes(value.key)) {
      keys = keys.filter(val => val !== value?.key);
    } else {
      keys.push(value?.key || '');
    }
    setFilter({ myTaskStatusFilterList: isClear ? [] : keys });
    applyFilter();
  };

  useEffect(() => {
    if (!milestoneCount || hasAppliedDefaultFilter) return;
    if (applyDefaultTaskStatusFilter) {
      const defaultTaskStatusFilter =
        Number(milestoneCount?.[ValidMilestoneAndStatusCodes.DEADLINE_ELAPSED]) > 0
          ? ValidMilestoneAndStatusCodes.DEADLINE_ELAPSED
          : Number(milestoneCount?.[ValidMilestoneAndStatusCodes.DEADLINE_APPROACHING]) > 0
            ? ValidMilestoneAndStatusCodes.DEADLINE_APPROACHING
            : Number(milestoneCount?.[ValidMilestoneAndStatusCodes.PENDING]) > 0
              ? ValidMilestoneAndStatusCodes.PENDING
              : undefined;
      if (defaultTaskStatusFilter) {
        setFilter({ myTaskStatusFilterList: [defaultTaskStatusFilter] });
        applyFilter();
      }
      setHasAppliedDefaultFilter(true);
    }
  }, [milestoneCount]);

  const handleOnClickMoreFilters = () => {
    setShowMoreFiltersDrawer(true);
  };

  const getAppliedMoreFiltersCount = () => {
    const polApplied = appliedFilters?.polList?.length ? 1 : 0;
    const podApplied = appliedFilters?.podList?.length ? 1 : 0;
    const ffApplied = appliedFilters?.ffIdList?.length ? 1 : 0;
    const chaApplied = appliedFilters?.chaIdList?.length ? 1 : 0;
    const customerApplied = appliedFilters?.customerIdList?.length ? 1 : 0;
    const dateApplied = appliedFilters.dateRangeFilter ? 1 : 0;
    const hasTrackingApplied = appliedFilters?.hasTracking ? 1 : 0;
    const carrierCodeApplied = appliedFilters?.carrierCodeList?.length ? 1 : 0;
    const plantApplied = appliedFilters?.plantIdList?.length ? 1 : 0;
    const incotermApplied = appliedFilters?.incotermList?.length ? 1 : 0;
    const poNumberListApplied = appliedFilters?.poNumberList?.length ? 1 : 0;
    const productKeyListApplied = appliedFilters?.productKeyList?.length ? 1 : 0;
    const myTaskStatusApplied = appliedFilters.myTaskStatusFilterList?.length ? 1 : 0;
    const myTaskListApplied = appliedFilters.myTaskNameFilterList?.length ? 1 : 0;
    const supplierIdList = appliedFilters.supplierIdList?.length ? 1 : 0;
    const sumOfFiltersCount = polApplied + podApplied + ffApplied + chaApplied +
      customerApplied + dateApplied + hasTrackingApplied + carrierCodeApplied + plantApplied +
      poNumberListApplied + productKeyListApplied + incotermApplied + myTaskListApplied +
      myTaskStatusApplied + supplierIdList;
    return sumOfFiltersCount;
  };

  const getAppliedFiltersCount = () => {
    const typeApplied = typeList?.length ? 1 : 0;
    const companyCodeApplied = companyCodeList?.length ? 1 : 0;
    const modeApplied = modeList?.length ? 1 : 0;
    const taskApplied = myTaskStatusFilterList?.length ? 1 : 0;
    const siInttraStatusApplied = isValidArray(appliedFilters?.siInttraStatusList) ? 1 : 0;
    const sumOfFiltersCount = getAppliedMoreFiltersCount() + typeApplied +
      companyCodeApplied + modeApplied + taskApplied + siInttraStatusApplied;
    return sumOfFiltersCount;
  };

  const handleOnClickResetFilter = () => {
    resetFilter();
  };

  const getModeIcon = (item) => {
    const isModeSelected = modeList.includes(item.key);
    switch (item.key) {
      case InquiryModes.FCL:
        return isModeSelected ? FCLWhiteIcon : FCLIcon;
      case InquiryModes.LCL:
      case ModesOfService.RPTL:
        return isModeSelected ? LCLWhiteIcon : LCLIcon;
      default:
        return isModeSelected ? AirWhiteIcon : AirIcon;
    }
  };

  const renderModeFilter = () => {
    const modes = modules?.show_road_instead_of_domestic
      ? modeOptions.filter(item => item.label !== 'Domestic')
      : modeOptions.filter(item => item.label !== 'Road');

    return (
      <>
        <span className={classes.filterLabel}>Mode</span>
        {modes.map((item: any) => {
          return (
            <Button
              className={
                modeList.includes(item.key)
                  ? classes.highlightedButtonStyle
                  : classes.buttonStyle
              }
              onClick={() => handleOnClickModeFilter(item.key)}
              data-filter-mode={item.key}
            >
              {item.key === InquiryModes.DOMESTIC && (
                <DomesticTruckIcon
                  strokeColor={modeList.includes(item.key) ? '#fff' : '#000'}
                  fill={modeList.includes(item.key) ? '#fff' : '#000'}
                />
              )}
              {item.key !== InquiryModes.DOMESTIC && (
                <img src={getModeIcon(item)} style={{ marginRight: 5 }} />
              )}
              <span>{item.label}</span>
            </Button>
          );
        })}
      </>
    );
  };

  const renderTypeFilter = () => {
    return (
      <>
        <span className={classes.filterLabel}>Type</span>
        {typeOptions.map((item: any) => {
          return (
            <Button
              className={
                appliedFilters.typeList?.includes(item.key)
                  ? classes.highlightedButtonStyle
                  : classes.buttonStyle
              }
              onClick={() => handleOnClickTypeFilter(item.key)}
              data-filter-type={item.key}
            >
              {item.label}
            </Button>
          );
        })}
      </>
    );
  };

  const renderMyTaskFilter = () => {
    let value;
    if (myTaskStatusFilterList?.length) {
      value = myTaskOptions
        .filter(val => val.key === myTaskStatusFilterList?.filter(key => key === val?.key)?.[0])
        ?.map(val => val?.label)
        ?.join(', ');
    }

    const menu = (
      <Menu onClick={handleOnClickMyTaskFilter}>
        {myTaskOptions.map(item => (
          <Menu.Item key={item.key} className={classes.myTaskQuickFilterMenuItem} title={item.label}>
            <div>
              <span data-filter-my-task-option={item.label}>{item.label}</span>
              {myTaskStatusFilterList?.includes(item.key)
                ? <Icon type='check' style={{ color: '#006ec3' }} />
                : ''}
            </div>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <>
        <span className={classes.filterLabel}>My Task</span>
        <div style={{ position: 'relative', width: '120px' }}>
          <Dropdown overlay={menu} trigger={['click']} data-filter-my-task={'my-task-dropdown'}>
            <div className={classes.emptyDiv}></div>
          </Dropdown>
          {value?.length ? (
            <Icon
              type="close-circle"
              theme="filled"
              className={classes.crossIcon}
              onClick={() => handleOnClickMyTaskFilter({}, true)}
            />
          ) : ''}
          <Input
            placeholder="Select"
            className={classes.myTaskQuickFilterDropdown}
            size="small"
            value={value}
            disabled={true}
            style={{ width: value?.length ? '110px' : '120px' }}
          />
        </div>
      </>
    );
  };

  const handleOnClickSortBy = (value, sortOrder) => {
    const descendingOrder = sortOrderTypes.DESCENDING === sortOrder;
    setFilter({
      sortBy: value,
      sortOrder: sortOrder,
      descendingOrder: descendingOrder,
    });
    applyFilter();
  };

  const renderSortBy = () => {
    const handleSortByClick = (param) => {
      const selectedOption = sortByOptions.find(option => option.key === param.key);
      if (selectedOption) {
        handleOnClickSortBy(selectedOption.key, sortOrderTypes.ASCENDING);
      }
      setDropdownVisible(false);
    };

    const handleSortOrderClick = (key, sortOrder, event) => {
      event.stopPropagation();
      handleOnClickSortBy(key, sortOrder);
      setDropdownVisible(false);
    };

    const handleClearSort = (event) => {
      event.stopPropagation();
      setFilter({ sortBy: undefined, sortOrder: undefined });
      applyFilter();
      setDropdownVisible(false);
    };

    const sortingOptions = (
      <Menu onClick={handleSortByClick}>
        {sortByOptions.map(item => (
          <Menu.Item key={item.key} className={classes.mySortMenuItem} title={item.label}>
            <div className={classes.sortMenuItemContainer}>
              <div>
                <span className={classes.sortbyTextlabel} data-filter-my-task-option={item.label}>
                  {item.label}
                </span>
                {appliedFilters.sortBy === item.key
                  ? <Icon type='check' className={classes.checkIcon} />
                  : ''}
              </div>
              <div className={classes.sortTypeIcons}>
                <Tooltip title="Ascending" placement="top">
                  <Icon
                    type="arrow-up"
                    className={`${classes.arrowIcon} ${appliedFilters.sortBy === item.key && appliedFilters.sortOrder === sortOrderTypes.ASCENDING ? classes.activeArrow : ''}`}
                    onClick={(e) => handleSortOrderClick(item.key, sortOrderTypes.ASCENDING, e)}
                  />
                </Tooltip>
                <Tooltip title="Descending" placement="top">
                  <Icon
                    type="arrow-down"
                    className={`${classes.arrowIcon} ${appliedFilters.sortBy === item.key && appliedFilters.sortOrder === sortOrderTypes.DESCENDING ? classes.activeArrow : ''}`}
                    onClick={(e) => handleSortOrderClick(item.key, sortOrderTypes.DESCENDING, e)}
                  />
                </Tooltip>
              </div>
            </div>
          </Menu.Item>
        ))}
      </Menu>
    );

    const getDisplayValue = () => {
      if (!appliedFilters.sortBy) return 'Select';
      const selectedOption = sortByOptions.find(option => option.key === appliedFilters.sortBy);
      return selectedOption ? selectedOption.label : appliedFilters.sortBy;
    };

    return (
      <>
        <span className={classes.filterLabel}>Sort By</span>
        <div className={classes.dropdownWrapper}>
          <Dropdown
            overlay={sortingOptions}
            trigger={['click']}
            visible={dropdownVisible}
            onVisibleChange={setDropdownVisible}
            data-filter-my-task={'sort-by-dropdown'}
          >
            <div className={classes.emptyDiv}></div>
          </Dropdown>
          {appliedFilters.sortBy ? (
            <Icon
              type="close-circle"
              theme="filled"
              className={classes.crossIcon}
              onClick={handleClearSort}
            />
          ) : ''}
          <Input
            placeholder="Select"
            className={classes.myTaskQuickFilterDropdown}
            size={"small"}
            value={getDisplayValue()}
            disabled={true}
          />
        </div>
      </>
    );
  };

  const renderMoreFilters = () => {
    if (!isMoreFiltersVisible) return;
    return (
      <div
        className={
          getAppliedMoreFiltersCount() === 0
            ? classes.moreFilters
            : classes.moreFiltersSelected
        }
        onClick={handleOnClickMoreFilters}
        id={'more-filters'}
      >
        <img src={getAppliedMoreFiltersCount() === 0 ? filterIcon : filterBlueIcon} />
        <span className={classes.filterForMoreFilters}>More Filters</span>
      </div>
    );
  };

  const renderResetFilter = () => {
    if (!isMoreFiltersVisible) return;
    return (
      <div className={classes.resetFilter} onClick={handleOnClickResetFilter} id='reset-filter'>
        Reset Filter
      </div>
    );
  };

  const renderMoreFilterDrawer = () => {
    return (
      <SEMoreFiltersDrawer
        visible={showMoreFiltersDrawer}
        handleClose={() => setShowMoreFiltersDrawer(false)}
        type={type}
        handleApply={() => {
          applyFilter();
          setShowMoreFiltersDrawer(false);
        }}
        handleResetMoreFilters={() => {
          resetMoreFilter();
        }}
      />
    );
  };

  const renderLine = () => {
    return <div className={classes.vertLine}></div>;
  };

  const handleCompanyCodeFilterChange = (key: string) => {
    const { companyCodeList } = appliedFilters;
    let selectedCompanyCode: string[];
    if (companyCodeList?.includes(key)) {
      selectedCompanyCode = companyCodeList.filter(item => item !== key);
    } else {
      selectedCompanyCode = [...companyCodeList, key];
    }
    setFilter({ companyCodeList: selectedCompanyCode });
    applyFilter();
  };

  const renderCompanyCodeFilter = () => {
    if (!isOrgReliance()) return;
    return (
      <div className={classes.companyCodeLabel}>
        <span className={classes.filterLabel}>Company Code</span>
        <div className={classes.companyCodeFilters}>
          {companyFilter.map((item: string) => {
            return (
              <Button
                className={
                  appliedFilters.companyCodeList?.includes(item)
                    ? classes.highlightedButtonStyle
                    : classes.buttonStyle
                }
                onClick={() => handleCompanyCodeFilterChange(item)}
                data-filter-company-code={item}
              >
                {item}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 10 }}>
      {renderModeFilter()}
      {renderTypeFilter()}
      <div className={classes.hideOnResize}>
        {renderMyTaskFilter()}
      </div>
      {renderSortBy()}
      {renderCompanyCodeFilter()}
      {renderLine()}
      {renderMoreFilters()}
      {getAppliedFiltersCount() !== 0 && renderResetFilter()}
      {showMoreFiltersDrawer && renderMoreFilterDrawer()}
    </div>
  );
};

const mapStateToProps = ({ shipmentExecutionReducer, masterData }) => {
  return {
    orgType: masterData.userData.type,
    modules: masterData.modules,
    showDiscoverBuyRates: masterData.modules?.show_discover_buy_rates,
    showDiscoverSellRates: masterData.modules?.show_discover_sell_rates,
    permissions: masterData.permissions,
    appliedFilters: shipmentExecutionReducer.appliedFilters,
    applyDefaultTaskStatusFilter: masterData.execution?.applyDefaultTaskStatusFilter,
    companyFilter: masterData.execution.validCompanyCodes,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    resetFilter: shipmentResetFilter(ownProps.type),
    resetMoreFilter: shipmentResetMoreFilter(ownProps.type),
    setPagination: shipmentSetPagination(ownProps.type),
    fetchAllShipment: fetchAllShipment(ownProps.type),
    setFilter: shipmentSetFilter,
    applyFilter: shipmentApplyFilter(ownProps.type),
    cancelFilter: cancelFilter(ownProps.type),
    setPrevPagination: setPrevPagination(ownProps.type),
  }, dispatch);
};

const options: HocOptions = {
  connectRedux: {
    useRedux: true,
    mapStateToProps,
    mapDispatchToProps,
  },
  connectJss: {
    useJss: true,
    styleSheet: SEFiltersStyles,
  },
};

const SEFiltersWithHOC = GenericHoc(options)(SEFilters);
export default SEFiltersWithHOC;
