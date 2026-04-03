import * as React from 'react';
import withStyles from 'react-jss';
import { StylesProps } from 'src/Library/Types';
import styles from './SEShipmentCard.styles';
import GetExecutionData from 'src/dto/response/getExecution';
import { rfqTypesNames } from 'src/utils/utils';
import { Icon, Tooltip, message, Menu, Dropdown, Checkbox, Form } from 'antd';
import { ModesOfService, OrgTypes } from 'src/Library/Constants';
import { stops } from 'src/Library/Helper';
import { editShipmentWatcher } from 'src/api/shipmentExecution';
import { MilestoneCodes } from '../SE.constants';
import { setSelectedShipments } from 'src/actions/shipmentExecutionActions';
const FCLIcon = require('src/assets/images/FCL.svg');
const LCLIcon = require('src/assets/images/LCL.svg');
const AirIcon = require('src/assets/images/Air.svg');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DomesticTruckIcon from 'src/components/common/icons/DomesticTruckIcon';

export interface SEShipmentCardProps extends StylesProps<ReturnType<typeof styles>> {
  cardData: GetExecutionData;
  selectedShipment: GetExecutionData;
  onClickCard: () => void;
  taskSummary: Record<string, number>;
  userEmail: string;
  toggleShipmentWatch: (params) => void;
  index: number;
  key: string;
  selectedShipments: Record<string, GetExecutionData>;
  setSelectedShipments: (selectedShipments: Record<string, GetExecutionData>) => void;
  do_not_show_supplier?: boolean;
  show_creator?: boolean;
  showRoadInsteadOfDomestic?: boolean;
}

const SEShipmentCard: React.FC<SEShipmentCardProps> = (props) => {
  const {
    classes, cardData, selectedShipment, onClickCard, taskSummary,
    toggleShipmentWatch, index, key, selectedShipments, setSelectedShipments,
    do_not_show_supplier, show_creator,
  } = props;

  const [watching, setWatching] = React.useState(false);

  const getModeIcon = () => {
    switch (cardData.mode) {
      case ModesOfService.FCL: return FCLIcon;
      case ModesOfService.LCL:
      case ModesOfService.RPTL: return LCLIcon;
      default: return AirIcon;
    }
  };

  const getTotal = () => {
    const count = Object.keys(taskSummary || {}).reduce((acc, cur) => acc + taskSummary[cur], 0);
    return count || '0';
  };

  const renderStats = () => {
    const totalTask = getTotal();
    return (
      <Tooltip title="Tasks Completed">
        <div className={classes.tasks}>
          <Icon type="carry-out" theme="twoTone" />
          <div>
            <span className={classes.tasksCompleted} data-card-completed-task={taskSummary?.Done || '0'}>
              {taskSummary?.Done || '0'}
            </span>
            <span data-card-total-task={totalTask}>/{totalTask}</span>
          </div>
        </div>
      </Tooltip>
    );
  };

  const renderFlag = () => {
    const milestoneLabel = MilestoneCodes[cardData.milestone]?.label;
    const flagStyle = { backgroundColor: milestoneLabel === 'On Hold' ? '#FEC89A ' : '#FEF9E9' };
    const iconType = milestoneLabel === 'On Hold' ? 'pause-circle' : 'flag';
    return (
      <Tooltip title="Current Milestone">
        <div className={classes.currentMilestone} style={flagStyle}>
          <Icon type={iconType} style={{ marginRight: 2 }} />
          <div data-card-milestone={milestoneLabel || '-'}>{milestoneLabel}</div>
        </div>
      </Tooltip>
    );
  };

  const toggleWatching = async (e) => {
    stops(e);
    setWatching(true);
    const { cardData, userEmail } = props;
    const { isWatching, watcherList, id: shipmentId } = cardData;
    let newWatcherList;
    if (isWatching) newWatcherList = watcherList?.filter((w) => w !== userEmail);
    else newWatcherList = watcherList?.length ? watcherList.concat(userEmail) : [userEmail];
    const response = await editShipmentWatcher(shipmentId, { watcherList: newWatcherList });
    if (response.isSuccess) {
      toggleShipmentWatch({ index: props.index, watcherList: newWatcherList, isWatching: !isWatching });
    } else { message.error(response.errorMessage); }
    setWatching(false);
  };

  const renderWatcher = () => (
    <Tooltip title={cardData?.isWatching
      ? <div style={{ fontSize: '10px' }}>
          {cardData?.watcherList?.length ? (
            <div style={{ borderBottom: '0.5px solid #DFDCDC' }}>
              <span style={{ color: '#C8F3FF', textDecoration: 'underline' }}>People who are watching :</span>
              <ul style={{ padding: '8px 0px 10px 10px', margin: 0, listStyleType: 'decimal' }}>
                {cardData?.watcherList?.map((watcher) => <li key={watcher}>{watcher}</li>)}
              </ul>
            </div>
          ) : null}
          <div style={{ textAlign: 'center', paddingTop: '4px' }}>Click again to stop being a <br /> watcher for this Shipment.</div>
        </div>
      : <div style={{ textAlign: 'center', fontSize: '10px' }}>Click to be a Watcher <br /> for this Shipment.</div>
    }>
      <Icon style={{ color: cardData?.isWatching ? 'black' : 'lightgrey', display: 'flex', alignItems: 'center' }}
        type={cardData?.isWatching ? 'eye' : 'eye-invisible'} onClick={toggleWatching} />
    </Tooltip>
  );

  const renderRight = () => (
    <div className={classes.bodyRight}>{renderFlag()}{renderStats()}{renderWatcher()}</div>
  );

  const renderOrigin = () => {
    let title = cardData.originPortName;
    let portCode = cardData.originPortCode;
    let portName = cardData.originPortName;
    const roadBasedModes = cardData.mode === ModesOfService.DOMESTIC || cardData.mode === ModesOfService.RPTL;
    if (roadBasedModes) {
      title = [cardData?.originLocationDetails?.name, cardData?.originLocationDetails?.address,
        cardData?.originLocationDetails?.landmark, cardData?.originLocationDetails?.city,
        cardData?.originLocationDetails?.state, cardData?.originLocationDetails?.countryName,
        cardData?.originLocationDetails?.pincode].filter(Boolean).join(', ');
      portCode = cardData.originLocationDetails?.city?.toUpperCase() || cardData.originLocationDetails?.name?.toUpperCase();
      portName = cardData.originLocationDetails?.pincode || cardData.originLocationDetails?.address;
    }
    return (
      <Tooltip title={title}>
        <div className={roadBasedModes ? classes.originDestinationDomestic : classes.originDestination}>
          <div className={classes.originDestinationCode}>{portCode || 'N/A'}</div>
          <div className={classes.originDestinationName}>{portName || 'N/A'}</div>
        </div>
      </Tooltip>
    );
  };

  const renderDestination = () => {
    let title = cardData.destinationPortName;
    let portCode = cardData.destinationPortCode;
    let portName = cardData.destinationPortName;
    const roadBasedModes = cardData.mode === ModesOfService.DOMESTIC || cardData.mode === ModesOfService.RPTL;
    if (roadBasedModes) {
      title = [cardData?.destinationLocationDetails?.name, cardData?.destinationLocationDetails?.address,
        cardData?.destinationLocationDetails?.landmark, cardData?.destinationLocationDetails?.city,
        cardData?.destinationLocationDetails?.state, cardData?.destinationLocationDetails?.countryName,
        cardData?.destinationLocationDetails?.pincode].filter(Boolean).join(', ');
      portCode = cardData.destinationLocationDetails?.city?.toUpperCase() || cardData.destinationLocationDetails?.name?.toUpperCase();
      portName = cardData.destinationLocationDetails?.pincode || cardData.destinationLocationDetails?.address;
    }
    return (
      <Tooltip title={title}>
        <div className={roadBasedModes ? classes.originDestinationDomestic : classes.originDestination}>
          <div className={classes.originDestinationCode}>{portCode || 'N/A'}</div>
          <div className={classes.originDestinationName}>{portName || 'N/A'}</div>
        </div>
      </Tooltip>
    );
  };

  const renderLine = () => <div className={classes.line}></div>;
  const renderLogo = () => cardData.carrierLogoUrl
    ? <img src={cardData.carrierLogoUrl} style={{ maxWidth: '105px' }} alt="Carrier logo" />
    : null;
  const renderLeft = () => (
    <div className={cardData.mode === ModesOfService.DOMESTIC ? classes.bodyLeftDomestic : classes.bodyLeft}>
      {renderOrigin()}{renderLine()}{renderDestination()}
    </div>
  );
  const renderBody = () => (
    <div className={classes.body}>{renderLeft()}{renderLogo()}{renderRight()}</div>
  );

  const renderContainerList = () => {
    const { containerList } = cardData;
    if (!containerList?.length) return '';
    const containerMenu = (
      <Menu>
        <Menu.Item className={classes.containerNumberLabel} key="containerNumber">
          Container Number{containerList.length > 1 ? 's' : ''}
        </Menu.Item>
        {containerList.map((cn) => (
          <Menu.Item key={cn} className={classes.containerNumbers}>
            <div className={classes.dotMenu}>.</div><div>{cn}</div>
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <Dropdown overlayClassName={classes.customContainerNumberDropdown} overlay={containerMenu}
        trigger={['click']} getPopupContainer={(trigger: any) => trigger.parentNode}>
        <div className={classes.containerListLabel}>
          {containerList.length} Container{containerList.length > 1 ? 's' : ''}
        </div>
      </Dropdown>
    );
  };

  const renderAlerts = () => {
    const dueToday = Boolean(Number(cardData.tasksDueTodayCount)) ? cardData.tasksDueTodayCount + ' Task(s) Due Today' : undefined;
    const overdue = Boolean(Number(cardData.tasksOverdueCount)) ? cardData.tasksOverdueCount + ' Task(s) Overdue' : undefined;
    const msgCount = Boolean(Number(cardData.commentCount)) ? cardData.commentCount + ' Message(s)' : undefined;
    const all = [...(dueToday ? [dueToday] : []), ...(overdue ? [overdue] : []), ...(msgCount ? [msgCount] : [])];
    if (!all.length) return null;
    const alertText = all.join(' | ');
    return (
      <div className={classes.alertMessage} style={cardData.extraData?.message ? { borderRadius: 0 } : {}}>
        {alertText}
      </div>
    );
  };

  const renderCargoType = () => (
    <div className={classes.cargoType}>
      {cardData?.cargoType && (
        <>
          <span>{cardData.cargoType}&nbsp;</span>
          {cardData.cargoSubtype ? (
            <Tooltip title={cardData.cargoSubtype}>
              <div style={{ maxWidth: '150px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                |{cardData.cargoSubtype}
              </div>
            </Tooltip>
          ) : ''}
        </>
      )}
    </div>
  );

  const renderFooter = () => (
    <div className={classes.footer}>
      {renderCargoType()}
      <div style={{ display: 'flex' }}>{renderContainerList()}{renderAlerts()}</div>
    </div>
  );

  const renderMode = () => (
    <div className={classes.mode}>
      {cardData.mode === ModesOfService.DOMESTIC
        ? <DomesticTruckIcon strokeColor={'#000'} fill={'#000'} style={{ marginRight: 6 }} />
        : <img src={getModeIcon()} style={{ marginRight: 6 }} alt={`${cardData.mode} mode icon`} />}
      <span style={{ fontWeight: 600 }}>{cardData.mode === ModesOfService.DOMESTIC && props?.showRoadInsteadOfDomestic ? 'Road' : cardData.mode}</span>
    </div>
  );

  const handleChangeSelection = (isSelected: boolean) => {
    const newSelection = { ...selectedShipments };
    if (isSelected) newSelection[cardData.id] = cardData;
    else delete newSelection[cardData.id];
    setSelectedShipments(newSelection);
  };

  const renderCheckbox = () => (
    <div style={{ marginRight: '5px' }}>
      <Checkbox checked={!!selectedShipments[cardData.id]} onChange={(e) => handleChangeSelection(e.target.checked)} />
    </div>
  );

  const renderReference = () => (
    <div className={classes.headerLeft}>
      {renderCheckbox()}
      <Tooltip title={cardData.masterReferenceNumber}>
        <div className={`${classes.referenceNumber} ${classes.ellipsis}`}>{cardData.masterReferenceNumber}</div>
      </Tooltip>
      <div className={`${classes.internalNumber} ${classes.ellipsis}`}></div>
      {show_creator && (
        <Tooltip title={cardData?.userName}>
          <span className={classes.supplierFFName}>{cardData?.userName}</span>
        </Tooltip>
      )}
      {renderMode()}
      <div className={classes.blackDot}></div>
      <div className={classes.type}>{rfqTypesNames[cardData.type]}</div>
      {(cardData.mode !== ModesOfService.DOMESTIC && cardData.mode !== ModesOfService.RPTL) && cardData.incoterm && <div className={classes.blackDot}></div>}
      <div className={classes.type}>
        {(cardData.mode !== ModesOfService.DOMESTIC && cardData.mode !== ModesOfService.RPTL) ? cardData.incoterm : ''}
      </div>
    </div>
  );

  const renderSupplierAndFF = () => {
    if (do_not_show_supplier) return null;
    return (
      <div className={classes.supplierFFDiv}>
        <Tooltip title={cardData.supplierName}>
          <span className={classes.supplierFFName}>{cardData.supplierName}</span>
        </Tooltip>
        {cardData.supplierName && <span style={{ margin: '0 4px' }}>|</span>}
        <Tooltip title={cardData.ffName}>
          <span className={classes.supplierFFName}>{cardData.ffName || (cardData.supplierName && '-')}</span>
        </Tooltip>
      </div>
    );
  };

  const renderHeader = () => (
    <div className={classes.header}>{renderReference()}{renderSupplierAndFF()}</div>
  );

  return (
    <div onClick={onClickCard} data-card-id={cardData.id}
      className={`${classes.parentDiv} ${selectedShipment.id === cardData.id ? classes.selectedShipment : ''} ${Object.keys(selectedShipments).length > 0 ? null : classes.cardHover}`}>
      {renderHeader()}
      {renderBody()}
      {renderFooter()}
    </div>
  );
};

const mapStateToProps = ({ shipmentExecutionReducer, masterData }) => ({
  selectedShipments: shipmentExecutionReducer.selectedShipments,
  do_not_show_supplier: masterData?.execution?.doNotShowSupplier,
  show_creator: masterData?.execution?.showCreator,
  showRoadInsteadOfDomestic: masterData?.modules?.show_road_instead_of_domestic,
});

const mapDispatchToProps = dispatch => bindActionCreators({ setSelectedShipments }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(Form.create()(React.memo(SEShipmentCard)))
);
