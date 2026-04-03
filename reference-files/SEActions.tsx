import Icon from 'antd/lib/icon';
import Tabs from 'antd/lib/tabs';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { fetchShipmentTasks, getShipmentDetails } from 'src/api/shipmentExecution';
import { StylesProps } from 'src/Library/Types';
import SEDocuments from './SEDocuments/SEDocuments';
import GetExecutionData from 'src/dto/response/getExecution';
import SETasksList from './SETasks/SETaskList/SETasksList';
import SEChat from './SEChat/SEChat';
import SEActivity from './SEActivity/SEActivity';
import NotFound404 from 'src/components/common/NotFound404';
import Tracking from './Tracking/tracking';
import DocumentRequest from './document-request/document-request';
import { SEActionTabsType, SEOrgType, TabType } from '../SE.interfaces';
import SEDetails from './SEDetails/SEDetails';
import Loader from 'src/components/common/Loader';
import { ExecutionDetails } from './SEDetails/shipment-details.types';
import { isValidString } from 'src/Library/Helper';
import GenericHoc from 'src/components/hoc/GenericHoc';
import { HocOptions } from 'src/components/hoc/GenericHoc.types';
import { InquiryModes, ModesOfService } from 'src/Library/Constants';
import { ValidMilestoneCodes } from '../SE.constants';
import { updateCardDataAtIndex } from 'src/actions/shipmentExecutionActions';
import { bindActionCreators } from 'redux';

const { TabPane } = Tabs;

const styles = theme => ({
  main: { backgroundColor: theme.colors.bgWhite, position: 'relative' },
  parentSEActions: {
    display: 'flex', justifyContent: 'space-between', height: 48, width: '100%',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  tabs: {
    '& .ant-tabs-nav .ant-tabs-tab-active': { color: theme.colors.text, fontWeight: 'bold', height: 48 },
    '& .ant-tabs-ink-bar': { backgroundColor: theme.colors.primaryDark, height: 4 },
  },
  layer2Style: {
    position: 'relative', zIndex: 2, background: 'white', height: 546, top: -48, overflow: 'hidden',
  },
  extrasHeader: {
    borderBottom: '1px solid #F7F7F7', fontWeight: 'bold', fontSize: theme.fontSize.h3,
    color: theme.colors.text, lineHeight: 1, padding: theme.spacing.md, height: 48,
    width: '100%', display: 'flex', justifyContent: 'space-between',
  },
  extraChild: {
    paddingBottom: 100, maxHeight: 'calc(100vh - 170px)', backgroundColor: '#FFFF',
    overflowY: 'auto', height: 'max-content',
  },
});

export interface SEActionsProps extends StylesProps<ReturnType<typeof styles>> {
  inttraCode; tabList: TabType[]; shippingLines;
  showEdit: () => void; resetFilters: () => void;
  orgType: 'shipper' | 'ff'; showInttraShippingInstructions;
  odexVgmReferenceNumber: number; showCourierTrackingV2;
  selectedShipment: GetExecutionData & { index: number };
  type: string;
  updateCardDataAtIndex: (data: { shipmentId: number | string; index: number; type: SEOrgType }) => void;
  actionVisible: 'activity' | 'chat' | 'taskDetails';
}

const SEActions: React.FC<SEActionsProps> = (props) => {
  const {
    classes, orgType, showEdit, resetFilters, selectedShipment,
    inttraCode, tabList, shippingLines, odexVgmReferenceNumber,
    showInttraShippingInstructions, showCourierTrackingV2, type,
    updateCardDataAtIndex, actionVisible,
  } = props;

  const [extras, setExtras] = useState<{ visible: 'activity' | 'chat' | 'taskDetails' | undefined }>();
  const [activeTabKey, setActiveTabKey] = useState<SEActionTabsType>('tasks');
  const [activeSubTab, setActiveSubTab] = useState<string>();
  const [shipmentDetails, setShipmentDetails] = useState<ExecutionDetails | undefined>();
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTask, setIsTask] = useState(true);
  const [taskDocuments, setTaskDocuments] = useState({});
  const [tasks, setTasks] = useState({});
  const [currentShipmentMilestone, setCurrentShipmentMilestone] = useState<keyof typeof ValidMilestoneCodes>();
  const [activityKey, setActivityKey] = useState(0);
  const [isTaskDetailsVisible, setIsTaskDetailsVisible] = useState<boolean>(false);

  const isInttraSIAllowed = shippingLines?.some(item =>
    item.dbId === shipmentDetails?.carrierId && isValidString(item.scacCode));
  const carrierAndPortOdexCodeCheck =
    isValidString(shipmentDetails?.carrierOdexLinerId) &&
    ((isValidString(shipmentDetails?.originPolCode) && isValidString(shipmentDetails?.originPolOdexCode)) ||
     (isValidString(shipmentDetails?.originPortCode) && isValidString(shipmentDetails?.originPortOdexCode)));
  const showFileVGMOption = odexVgmReferenceNumber && carrierAndPortOdexCodeCheck;
  const showRequestForm13Button = carrierAndPortOdexCodeCheck;
  const isDocumentRequestVisible =
    ((showInttraShippingInstructions && inttraCode && isInttraSIAllowed) ||
     showFileVGMOption || showRequestForm13Button) &&
    shipmentDetails?.mode === InquiryModes.FCL;

  const fetchShipmentDetails = async () => {
    const response = await getShipmentDetails({
      shipmentId: selectedShipment?.id, viewType: orgType.toUpperCase() as SEOrgType,
    }) as any;
    if (response.isSuccess) setShipmentDetails(response.data || {});
  };

  useEffect(() => {
    const isValidAction = ['activity', 'chat', 'taskDetails'].includes(actionVisible);
    setExtras({ visible: isValidAction ? actionVisible : undefined });
    if (selectedShipment?.id) {
      fetchShipmentDetails();
      if (tabList?.length > 0) setActiveTabKey(tabList[0].key as SEActionTabsType);
      else setActiveTabKey('tasks');
    }
    setIsTaskDetailsVisible(false);
  }, [selectedShipment]);

  const handleOnChangeActiveTab = (key: SEActionTabsType, subTab?: string) => {
    setActiveTabKey(key); setActiveSubTab(subTab);
  };

  const updateCardData = () => {
    updateCardDataAtIndex({ index: selectedShipment.index, shipmentId: selectedShipment.id, type: orgType?.toUpperCase() as SEOrgType });
  };

  const renderDocuments = () => activeTabKey !== 'documents' ? null : <SEDocuments shipmentId={selectedShipment.id} />;
  const renderDetails = () => activeTabKey !== 'details' ? null : (
    <SEDetails resetFilters={resetFilters} showEdit={showEdit} selectedShipment={selectedShipment}
      inquiryType={'Export'} type={orgType.toUpperCase() as SEOrgType} />
  );
  const renderTracking = () => activeTabKey !== 'tracking' ? null : (
    <Tracking updateCardData={updateCardData} type={orgType?.toUpperCase() as SEOrgType}
      selectedShipment={selectedShipment} shipmentDetails={shipmentDetails}
      refreshShipmentDetails={fetchShipmentDetails} showCourierTrackingV2={showCourierTrackingV2} />
  );

  const renderTasks = () => {
    if (activeTabKey !== 'tasks') return null;
    const fetchTasks = async (sourceObjectId, showLoader = true) => {
      if (showLoader) setIsTasksLoading(true);
      const responses: any[] = await Promise.all([fetchShipmentTasks({ shipmentId: sourceObjectId })]);
      if (responses[0].isSuccess) {
        const tasks = responses[0].data;
        if (tasks && Object.keys(tasks).length) { setIsTask(true); setTaskDocuments({}); }
        setTasks(tasks ? Object.keys(tasks).reduce((acc, key) => {
          if (tasks[key]) {
            acc[key] = {
              ...tasks[key],
              tasks: tasks[key].tasks?.map(el => {
                const disabled = responses[0].data.currentSequenceNumber &&
                  (el.sequenceNumber > responses[0].data.currentSequenceNumber);
                return { ...el, milestone: key, disabled };
              }),
            };
          }
          return acc;
        }, {}) : {});
        setActivityKey(activityKey + 1);
        setCurrentShipmentMilestone(tasks.currentShipmentMilestone);
      }
      setIsTasksLoading(false);
    };
    return (
      <SETasksList
        tasks={tasks} taskDocuments={taskDocuments} fetchTasks={fetchTasks}
        isLoading={isTasksLoading} isTask={isTask} shipmentDetails={shipmentDetails}
        sourceObjectId={selectedShipment.id} selectedShipment={selectedShipment}
        type={orgType?.toUpperCase() as SEOrgType}
        currentShipmentMilestone={currentShipmentMilestone}
        setIsTaskDetailsVisible={setIsTaskDetailsVisible}
        gotoContainerTrackingTab={() => handleOnChangeActiveTab('tracking')}
        gotoDocumentRequest={(subTab) => handleOnChangeActiveTab('documentRequest', subTab)}
        updateCardData={() => updateCardData()}
      />
    );
  };

  const renderActions = (tabs: TabType[] = []) => {
    const defaultTabsList = [
      { key: 'tasks', label: 'Tasks' }, { key: 'documents', label: 'Documents' },
      { key: 'details', label: 'Details' }, { key: 'tracking', label: 'Tracking' },
      { key: 'documentRequest', label: 'Document Request' },
    ];
    let finalTabs = tabs.length ? tabs : defaultTabsList;
    finalTabs = finalTabs.filter(tab =>
      tab.key !== 'tracking' || (shipmentDetails?.mode !== InquiryModes.DOMESTIC && shipmentDetails?.mode !== ModesOfService.RPTL));
    finalTabs = finalTabs.filter(tab => tab.key !== 'documentRequest' || isDocumentRequestVisible);
    defaultTabsList.forEach(defaultTab => {
      if (!finalTabs.some(tab => tab.key === defaultTab.key)) finalTabs.push(defaultTab);
    });
    finalTabs = finalTabs.filter(tab =>
      (tab.key !== 'tracking' || (shipmentDetails?.mode !== InquiryModes.DOMESTIC && shipmentDetails?.mode !== ModesOfService.RPTL)) &&
      (tab.key !== 'documentRequest' || isDocumentRequestVisible));

    return notFound ? <NotFound404 title="Shipment Not Found" /> : (
      <div className={classes.parentSEActions}>
        <div style={{ width: '100%' }}>
          <Tabs activeKey={activeTabKey} className={classes.tabs}
            tabBarStyle={{ fontSize: '12px', color: '#666666', marginBottom: '0px', height: 48 }}
            onChange={handleOnChangeActiveTab}>
            {finalTabs.map(tab => <TabPane tab={tab.label} key={tab.key} />)}
          </Tabs>
        </div>
        <div style={{ display: 'flex', padding: '12px 16px' }}>
          <div style={{ marginRight: 8, cursor: 'pointer' }} onClick={() => setExtras({ ...extras, visible: 'activity' })}>
            <Icon style={{ fontSize: 24 }} type="unordered-list" />
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => setExtras({ ...extras, visible: 'chat' })}>
            <Icon style={{ fontSize: 24 }} theme="filled" type="message" />
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentRequest = () => activeTabKey !== 'documentRequest' ? null : (
    <DocumentRequest activeSubTab={activeSubTab} shipmentDetails={shipmentDetails}
      selectedShipment={selectedShipment} isInttraSIAllowed={isInttraSIAllowed}
      currentShipmentMilestone={currentShipmentMilestone}
      gotoTaskTab={() => handleOnChangeActiveTab('tasks')}
      gotoDocumentRequest={() => handleOnChangeActiveTab('documentRequest')} />
  );

  const renderActivity = () => extras?.visible !== 'activity' ? null : (
    <div className={classes.layer2Style}>
      <div className={classes.extrasHeader}>
        <div>Activity</div>
        <div><Icon onClick={() => setExtras({ ...extras, visible: undefined })} type="cross" /></div>
      </div>
      <SEActivity shipmentId={selectedShipment.id} />
    </div>
  );

  const renderChat = () => extras?.visible !== 'chat' ? null : (
    <div className={classes.layer2Style}>
      <div className={classes.extrasHeader}>
        <div>Chat</div>
        <div><Icon onClick={() => setExtras({ ...extras, visible: undefined })} type="cross" /></div>
      </div>
      <SEChat shipmentId={selectedShipment.id} />
    </div>
  );

  if (!selectedShipment?.id) return <Loader />;

  return (
    <div className={classes.main}>
      <div style={{ display: isTaskDetailsVisible ? 'none' : 'block' }}>{renderActions(tabList)}</div>
      <div className={classes.extraChild} style={{ display: extras?.visible ? 'none' : 'block' }}>
        {renderDocuments()}{renderDetails()}{renderDocumentRequest()}{renderTracking()}{renderTasks()}
      </div>
      {renderActivity()}{renderChat()}
    </div>
  );
};

const mapStateToProps = ({ masterData }) => ({
  inttraCode: masterData.inttraCode,
  shippingLines: masterData?.globalShippingLines,
  odexVgmReferenceNumber: masterData.odexVgmReferenceNumber,
  showInttraShippingInstructions: masterData.modules.show_inttra_shipping_instructions,
  showCourierTrackingV2: masterData?.modules?.show_courier_tracking_v2,
  tabList: masterData?.execution?.tabList,
});

const mapDispatchToProps = dispatch => bindActionCreators({ updateCardDataAtIndex }, dispatch);

const options: HocOptions = {
  connectRedux: { useRedux: true, mapStateToProps, mapDispatchToProps },
  connectJss: { useJss: true, styleSheet: styles },
};

export default GenericHoc(options)(SEActions);
