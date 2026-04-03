import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import Tooltip from 'antd/lib/tooltip';
import moment from 'moment';
import * as React from 'react';
import withStyles from 'react-jss';
import { SETask } from "src/dto/response/fetchShipmentTasks";
import { StylesProps } from "src/Library/Types";
import { getStylesForLabel } from '../SETasksUtils';
import styles from './SETasksListRow.styles';

interface SETasksListRowProps extends StylesProps<ReturnType<typeof styles>> {
  col: string; index: number; record: SETask;
  currentShipmentMilestone: string;
  messageForSI: React.ReactElement; messageForVGM: React.ReactElement; messageForForm13: React.ReactElement;
  taskStatusLoading: Record<string, boolean>;
  handleToggleWatch: (record: SETask) => void;
  isVGMButtonVisible: (record: SETask) => boolean;
  renderThirdPartyActions: (record: SETask) => void;
  isForm13ButtonVisible: (record: SETask) => boolean;
  handleUpdateStatus: (val: string, record: SETask) => void;
  isSubmitOnInttraButtonVisible: (record: SETask) => boolean;
  handleShowTaskDetails: (record: SETask, isEditable: boolean) => void;
}

const SETasksListRow: React.FC<SETasksListRowProps> = ({
  record, col, index, classes, messageForSI, messageForVGM, messageForForm13,
  taskStatusLoading, handleToggleWatch, handleUpdateStatus, isVGMButtonVisible,
  isForm13ButtonVisible, handleShowTaskDetails, renderThirdPartyActions,
  currentShipmentMilestone, isSubmitOnInttraButtonVisible,
}) => {
  const isEditable = record?.isEditable && (record.status === 'Not Started' || record.status === 'In Progress');

  const isDeadlinePast = (record: SETask) => record?.deadline && moment().valueOf() > record.deadline;
  const isDeadlineNear = (record: SETask, hours = 35) => record?.deadline && moment().add(hours, 'hours').valueOf() > record.deadline;

  const renderColDeadline = (record: SETask) => {
    if (!record?.deadline) return <></>;
    const deadline = moment(record?.deadline);
    const crossedDeadline = isDeadlinePast(record);
    const nearDeadline = isDeadlineNear(record);
    const date = crossedDeadline ? deadline.format('DD MMM YYYY') : `${deadline.fromNow(true)} left`;
    return (
      <span style={{
        color: crossedDeadline || nearDeadline ? 'red' : '',
        fontStyle: crossedDeadline || nearDeadline ? 'italic' : undefined, fontSize: 10,
      }}>
        Deadline: {date}
      </span>
    );
  };

  const renderAmendButton = (record: SETask) => {
    if (!record.isAmendmentAllowed) return;
    return <Button className={classes.inttraButton} size="small" onClick={() => handleUpdateStatus('Amend Task', record)}>Amend Task</Button>;
  };

  const renderTaskName = (record: SETask, isEditable: boolean) => {
    if (!record.name) return '-';
    const labelStyles = getStylesForLabel(record.approvalStatus);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className={classes.textCol} onClick={() => handleShowTaskDetails(record, isEditable)}>
            <div className={classes.approveStatusDiv} style={{ color: labelStyles.styles?.color }}>
              {record.id && record.approvalStatus && labelStyles.text}
            </div>
            <div className={classes.taskName}>{record.name}</div>
            <div className={classes.deadlineDiv}>{record?.deadline && renderColDeadline(record)}</div>
          </div>
          {renderThirdPartyActions(record)}
          {renderAmendButton(record)}
        </div>
        <div>
          {isForm13ButtonVisible?.(record) && messageForForm13}
          {isVGMButtonVisible?.(record) && messageForVGM}
          {isSubmitOnInttraButtonVisible?.(record) && messageForSI}
        </div>
      </div>
    );
  };

  const renderTaskStatus = (record: SETask, col: string, isEditable: boolean) => {
    if (!record?.id) return '-';
    if (taskStatusLoading[record?.id]) return <span style={{ marginLeft: '30%' }}><Spin /></span>;
    const updatedAt = moment(record?.updatedAt).fromNow();
    const bookingSentTask = record?.code === "SMT65" && record?.status === 'Done';
    return (
      <div className={classes.flexCol}>
        <div className={classes.flexStart}>
          <Tooltip title={bookingSentTask ? 'Booking Sent' : record?.status}>
            <Select
              disabled={!record.isStatusChangeAllowed || !isEditable || bookingSentTask}
              className={record?.status === 'Not Started' ? (classes as any).Not_Started
                : record?.status === 'In Progress' ? (classes as any).In_Progress : (classes as any)[record?.status]}
              value={bookingSentTask ? 'Booking Sent' : record?.status}
              style={{ width: 100 }} size="small"
              onChange={async (val) => { if (!record?.id) return; handleUpdateStatus(val, record); }}>
              <Select.Option style={{ backgroundColor: '#FFFED2', fontWeight: 600 }} key="In Progress">In Progress</Select.Option>
              <Select.Option style={{ backgroundColor: '#D3FFEA', fontWeight: 600 }} key="Done">Done</Select.Option>
              <Select.Option style={{ backgroundColor: '#FFD3D3', fontWeight: 600 }} key="Cancelled">Cancelled</Select.Option>
            </Select>
          </Tooltip>
        </div>
        <div className={classes.smallText}>{updatedAt}</div>
      </div>
    );
  };

  const renderTaskAssignee = (record: SETask) => {
    if (!record.responsibleOrganisationName?.length && !record.responsibleTeamName && !record.responsibleUserName)
      return <div style={{ fontSize: 10, color: '#D9D9D9' }}>Not Assigned</div>;
    return (
      <div className={classes.assigneeDiv}>
        <div className={classes.assigneeUser}>
          {record.responsibleUserName && `${record.responsibleUserName} |`}
          <span style={{ fontWeight: 500 }}>{record.responsibleTeamName}</span>
        </div>
        <div style={{ color: '#333333' }}>{record.responsibleOrganisationName}</div>
      </div>
    );
  };

  const renderWatcherIcon = (record: SETask) => {
    const onHold = currentShipmentMilestone === 'ON_HOLD' || currentShipmentMilestone === 'DELETED';
    const { isWatching, watcherList } = record;
    return (
      <div style={{ textAlign: 'right', color: onHold ? 'lightgrey' : 'black',
        pointerEvents: onHold ? 'none' : 'auto', cursor: onHold ? 'not-allowed' : 'auto' }}
        onClick={() => handleToggleWatch(record)}>
        {isWatching ? (
          <Tooltip title={
            <div style={{ fontSize: '10px' }}>
              {watcherList?.length ? (
                <div style={{ borderBottom: '0.5px solid #DFDCDC' }}>
                  <span style={{ color: '#C8F3FF', textDecoration: 'underline' }}>People who are watching :</span>
                  <ul style={{ padding: '8px 0px 10px 10px', margin: 0, listStyleType: 'decimal' }}>
                    {watcherList.map(w => <li key={w}>{w}</li>)}
                  </ul>
                </div>
              ) : null}
              <div style={{ textAlign: 'center', paddingTop: '4px', minWidth: '116px' }}>Click again to stop being a <br /> watcher for this Task.</div>
            </div>
          }><Icon type="eye" theme="twoTone" /></Tooltip>
        ) : (
          <Tooltip title={<div className={classes.addWatcherText}>Click to be a Watcher <br /> for this Task.</div>}>
            <Icon className={classes.watchIcon} type="eye-invisible" />
          </Tooltip>
        )}
      </div>
    );
  };

  const onHold = currentShipmentMilestone === 'ON_HOLD' || currentShipmentMilestone === 'DELETED';
  switch (col) {
    case 'sequenceNumber': return <div style={{ textAlign: 'right', paddingTop: 8 }}>{index + 1}</div>;
    case 'name': return renderTaskName(record, isEditable && !record.disabled && !onHold);
    case 'status': return renderTaskStatus(record, col, !record.disabled && !onHold);
    case 'responsibleUserName': return renderTaskAssignee(record);
    case 'action': return <div style={{ display: 'flex' }}>{renderWatcherIcon(record)}</div>;
    default: return <div className={classes.textCol} style={{ display: 'flex', justifyContent: 'flex-start' }}>{record[col]}</div>;
  }
};

export default withStyles(styles)(SETasksListRow);
