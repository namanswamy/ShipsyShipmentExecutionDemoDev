import * as React from 'react';
import Button from 'antd/lib/button';
import Collapse from 'antd/lib/collapse';
import Icon from 'antd/lib/icon';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Progress from 'antd/lib/progress';
import Table from 'antd/lib/table';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { editShipmentTask, form13RequestOdexRefNumber } from 'src/api/shipmentExecution';
import { FetchShipmentTasksData, SETask } from 'src/dto/response/fetchShipmentTasks';
import { OrgTypes, InquiryModes } from 'src/Library/Constants';
import { MilestoneCodes } from '../../../SE.constants';
import { updateCardDataAtIndex, fetchDropdownMasterdata, fetchPendingContainerCount } from 'src/actions/shipmentExecutionActions';
import SETasksListRow from './SETasksListRow';
import styles from './SETasksList.styles';
import { stops, isValidString } from 'src/Library/Helper';
import Loader from 'src/components/common/Loader';
import { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import GenericHoc from 'src/components/hoc/GenericHoc';
import { SEOrgType } from '../../../SE.interfaces';
// ... (modal imports omitted for brevity)

interface SETasksListProps {
  sourceObjectId: string;
  selectedShipment: any;
  fetchTasks: (sourceObjectId: string, showLoader?: boolean) => Promise<void>;
  handleSort: (col: string, order: 'asc' | 'desc') => void;
  tasks: FetchShipmentTasksData;
  isLoading: boolean;
  isTask: boolean;
  permissions: any;
  type: SEOrgType;
  currentUserEmail: string;
  currentShipmentMilestone: keyof FetchShipmentTasksData;
  setIsTaskDetailsVisible: (flag: boolean) => void;
  gotoContainerTrackingTab: () => void;
  shipmentDetails: any;
  gotoDocumentRequest: (tab: string) => void;
  updateCardData: () => void;
  // ... more props
}

const SETasksList: React.FC<SETasksListProps> = ({ /* destructured props */ }) => {
  const dispatch = useDispatch();
  // ... state setup with useGenericState and useVisibility hooks

  const onHold = currentShipmentMilestone === 'ON_HOLD' || currentShipmentMilestone === 'DELETED';

  useEffect(() => { fetchTasks(sourceObjectId); }, [sourceObjectId]);

  const handleToggleWatch = async (record) => {
    const { isWatching, watcherList } = record;
    let newWatcherList;
    if (isWatching) newWatcherList = watcherList.filter((w) => w !== currentUserEmail);
    else newWatcherList = watcherList?.length ? watcherList.concat(currentUserEmail) : [currentUserEmail];
    const body = { ...record, taskId: record.id, sourceObjectType: 'SHIPMENT', sourceObjectId, watcherList: newWatcherList };
    const response = await editShipmentTask({ shipmentId: sourceObjectId, taskId: record.id }, body);
    if (response?.isSuccess) await fetchTasks(sourceObjectId, false);
    else message.error(response.errorMessage);
  };

  const handleUpdateStatus = async (status, record) => {
    record.status = status;
    const body = {
      sourceObjectId, responsibleOrganisationId: record.responsibleOrganisationId,
      responsibleTeamId: record.responsibleTeamId, responsibleUserId: record.responsibleUserId,
      name: record.name, deadline: record.deadline, taskId: record?.id,
      sourceObjectType: 'SHIPMENT', status, deadlineDelta: record.deadlineDelta,
    };
    // set loading, call API, handle response, refresh tasks
    const response = await editShipmentTask({ shipmentId: sourceObjectId, taskId: record?.id }, body);
    if (!response.isSuccess) message.error(response.errorMessage);
    await fetchTasks(sourceObjectId, false);
    updateCardData();
  };

  const addTaskPermissionAccess = () => (
    (type === OrgTypes.SHIPPER && permissions?.SHIPMENT_TASK_ADD_EDIT_SHIPPER) ||
    (type === OrgTypes.FF && permissions?.SHIPMENT_TASK_ADD_EDIT_VENDOR)
  );

  const renderAddTask = ({ milestone }) => (
    <div onClick={(e) => { stops(e); /* show add task modal */ }}
      style={{ color: onHold ? 'lightgrey' : '#1890FF', pointerEvents: onHold ? 'none' : 'auto', cursor: onHold ? 'not-allowed' : 'pointer' }}>
      + Add Task
    </div>
  );

  const renderCollapseHeader = ({ title, done, overdue, total, milestone }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex' }}>
        <div className={classes.milestoneName}>{title}</div>
        <div style={{ marginLeft: 24, whiteSpace: 'nowrap' }}>
          <span className={classes.taskDoneLabel}>Tasks Done:</span>
          <span style={{ width: 10, marginRight: 8, fontWeight: 600 }}>
            <span style={{ fontSize: 12, marginRight: 2 }}>{done}</span>
            <span style={{ fontSize: 10 }}>/{total}</span>
          </span>
          <span style={{ width: 50 }}>
            <Progress percent={((done + overdue) * 100) / total}
              successPercent={(done * 100) / total} showInfo={false}
              strokeColor='#F75555' trailColor="#FAF9F6" strokeLinecap='square'
              className={classes.progress} />
          </span>
        </div>
        {overdue > 0 && (
          <div style={{ marginLeft: 60, color: '#DF1D1D' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{overdue}</span>
            <span style={{ fontSize: 8, marginLeft: 5 }}>Task(s) crossed deadline</span>
          </div>
        )}
      </div>
      {addTaskPermissionAccess() && renderAddTask({ milestone: milestone.key })}
    </div>
  );

  const getMilestones = () => {
    const sortOrder = ['DRAFT', 'AT_ORIGIN', 'IN_TRANSIT', 'TRANSSHIPMENT', 'DESTINATION', 'COMPLETED', 'ON_HOLD', 'DELETED'];
    return sortOrder.map(key => ({
      key, label: MilestoneCodes[key]?.label, data: tasks?.[key],
    })).filter(el => el.data);
  };

  const getColumns = () => {
    const columnLabels = { sequenceNumber: 'S.N.', name: 'Task Name', status: 'Status', responsibleUserName: 'Assignee', action: '' };
    return Object.keys(columnLabels).map(col => ({
      key: col, align: 'left', fixed: col === 'action' ? 'right' : false,
      width: col === 'sequenceNumber' ? 40 : col === 'name' ? 280 : col === 'status' ? 112 : col === 'responsibleUserName' ? 156 : 10,
      title: () => <div style={{ color: '#666666', fontSize: 10 }}>{columnLabels[col]}</div>,
      render: (text, record, index) => (
        <SETasksListRow record={record} col={col} index={index}
          taskStatusLoading={taskStatusLoading} handleUpdateStatus={handleUpdateStatus}
          handleShowTaskDetails={handleShowTaskDetails} handleToggleWatch={handleToggleWatch}
          currentShipmentMilestone={currentShipmentMilestone}
          renderThirdPartyActions={renderThirdPartyActions}
          messageForSI={messageForSI} isSubmitOnInttraButtonVisible={isSubmitOnInttraButtonVisible}
          messageForVGM={messageForVGM} isVGMButtonVisible={isVGMButtonVisible}
          messageForForm13={messageForForm13} isForm13ButtonVisible={isForm13ButtonVisible} />
      ),
    }));
  };

  const renderTasksList = () => {
    const columns = getColumns();
    return getMilestones().map(milestone => {
      const { done, total, overdueTaskCount: overdue } = milestone.data;
      return (
        <Collapse defaultActiveKey={[currentShipmentMilestone]} className={classes.collapse}
          style={{ background: total && done === total ? '#DBF3E5' : '#EDEDED' }}>
          <Collapse.Panel
            header={renderCollapseHeader({ title: milestone.label, done, overdue, total, milestone })}
            style={{ borderRadius: '0px 4px 4px 0px', border: '1px solid #F7F7F7', backgroundColor: '#ffffff' }}
            key={milestone.key}>
            <Table bordered={false} pagination={false} rowKey={(record: any) => record.id}
              className={classes.table} columns={columns} size="small"
              dataSource={milestone.data?.tasks}
              rowClassName={(record: SETask) => {
                const res = [classes.taskRow];
                if (record.disabled) res.push(classes.disabledRow);
                if (record?.deadline && moment().valueOf() > record?.deadline) res.push(classes.deadlinePassedRow);
                return res.join(' ');
              }} />
          </Collapse.Panel>
        </Collapse>
      );
    });
  };

  return (
    <div>
      {/* All modals rendered here */}
      <div className={classes.taskListContainer}>
        {isLoading ? <Loader /> : (isTask ? renderTasksList() : renderNoTasks())}
      </div>
    </div>
  );
};

const mapStateToProps = ({ masterData, shipmentExecutionReducer }) => ({
  permissions: masterData.permissions,
  showInttraShippingInstructions: masterData.modules.show_inttra_shipping_instructions,
  inttraCode: masterData.inttraCode,
  siPendingCount: shipmentExecutionReducer.siPendingCount,
  currentUserEmail: masterData.userData?.email,
  odexVgmReferenceNumber: masterData.odexVgmReferenceNumber,
  odexForm13ReferenceNumber: masterData.odexForm13ReferenceNumber,
  shippingLines: masterData?.globalShippingLines,
});

const mapDispatchToProps = dispatch => bindActionCreators({ fetchPendingContainerCount }, dispatch);

export default GenericHoc({
  connectRedux: { useRedux: true, mapStateToProps, mapDispatchToProps },
  connectJss: { useJss: true, styleSheet: styles },
})(SETasksList);
