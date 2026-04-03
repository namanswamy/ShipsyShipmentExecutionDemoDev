import { tokens } from 'src/design-system';
import { createStyles } from "src/hooks/useStyles";

function getVariableStyle() {
  const obj = { Not_Started: '#F4F4F4', In_Progress: '#FFFED2', Done: '#D3FFEA', Cancelled: '#FFD3D3' };
  const result = {};
  for (const i in obj) {
    result[`select-${i}`] = {
      '& .ant-select-selection--single': { backgroundColor: obj[i], border: 0 },
    };
  }
  return result;
}

const styles = createStyles((theme, props) => ({
  milestoneName: { fontSize: tokens.fontSize.body, color: tokens.colors.text, fontWeight: tokens.fontWeight.semibold, width: 80 },
  taskDoneLabel: { fontSize: 8, color: tokens.colors.textSecondary, width: 10, marginRight: 10 },
  table: {
    margin: `${tokens.spacing.md}px 0`, borderRadius: tokens.radius.sm, background: '#fff', cursor: 'pointer',
    '& .ant-table-thead': { fontSize: tokens.fontSize.body, whiteSpace: 'pre-line !important', border: `1px solid ${tokens.colors.border}`, color: '#424242', padding: 0 },
    '& .ant-table-tbody > tr > td': { verticalAlign: 'top' },
    '& .ant-table-tbody > tr': { '&:hover': { '& #pendingCount': { backgroundColor: 'unset' } } },
    '& .ant-table-thead .ant-table-column-title': { whiteSpace: 'nowrap' },
  },
  noTaskDiv: {
    width: '100%', height: '173px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', backgroundColor: tokens.colors.bgWhite,
  },
  addTaskDiv: {
    padding: '2px 10px', borderRadius: 13, backgroundColor: '#FAFAFA',
    fontSize: tokens.fontSize.small, color: tokens.colors.primaryDark,
    fontWeight: tokens.fontWeight.semibold, '&:hover': { backgroundColor: '#EDEDED' },
  },
  taskRow: { height: 62 },
  disabledRow: { opacity: .5 },
  deadlinePassedRow: { backgroundColor: '#ff000011' },
  collapse: {
    '& .ant-collapse-content-box': { padding: 0 },
    '& .ant-table-wrapper': { margin: 0 },
    '& .ant-collapse-content': { border: 0 },
    '& .ant-table-small': { border: 0 },
    marginBottom: 5, border: 0,
  },
  progress: {
    '& .ant-progress-inner': { background: '#ededed', borderRadius: 0 },
    '& .ant-progress-bg': { borderRadius: 0 },
    '& .ant-progress-outer': { width: 100 },
  },
  ...getVariableStyle(),
  inttraButton: {
    fontSize: tokens.fontSize.caption, height: 28, color: tokens.colors.text,
    borderColor: '#999999', fontWeight: tokens.fontWeight.semibold,
  },
  pendingContainerCount: {
    fontSize: '11px', display: 'block', backgroundColor: 'rgba(255,210,142,0.15)',
    padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`, borderRadius: tokens.radius.sm,
    fontWeight: tokens.fontWeight.semibold, color: tokens.colors.textSecondary,
  },
  taskListContainer: { backgroundColor: '#F1EEE8' },
}));

export default styles;
