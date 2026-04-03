import { tokens } from 'src/design-system';

const statusBackgroundColor = () => {
  const statusColor = { Not_Started: '#F4F4F4', In_Progress: '#FFFED2', Done: '#D3FFEA', Cancelled: '#FFD3D3' };
  const result = {};
  Object.keys(statusColor).forEach(status =>
    result[status] = {
      '& .ant-select-selection--single': {
        fontWeight: tokens.fontWeight.semibold, fontSize: tokens.fontSize.small,
        width: 100, border: 0, backgroundColor: statusColor[status],
      },
    }
  );
  return result;
};

const styles = theme => ({
  taskName: {
    fontWeight: tokens.fontWeight.bold, fontSize: tokens.fontSize.body,
    color: tokens.colors.primaryDark, textDecoration: 'underline',
  },
  textCol: { color: '#424242', textTransform: 'capitalize', display: 'flex', flexDirection: 'column' },
  watchIcon: { '& :hover': { color: '#3797F7' } },
  smallText: { fontSize: tokens.fontSize.caption, color: tokens.colors.textSecondary },
  flexCol: { display: 'flex', flexDirection: 'column' },
  flexStart: { display: 'flex', justifyContent: 'flex-start' },
  addWatcherText: { textAlign: 'center', fontSize: tokens.fontSize.caption, minWidth: '116px' },
  approveStatusDiv: { fontSize: 8, fontWeight: tokens.fontWeight.semibold, height: 8 },
  deadlineDiv: { height: 10, display: 'flex' },
  assigneeDiv: { fontSize: tokens.fontSize.caption, display: 'flex', flexDirection: 'column' },
  assigneeUser: { fontSize: tokens.fontSize.small, color: tokens.colors.text, fontWeight: tokens.fontWeight.semibold },
  inttraButton: {
    fontSize: tokens.fontSize.caption, height: 28, color: tokens.colors.text,
    borderColor: '#999999', fontWeight: tokens.fontWeight.semibold,
  },
  ...statusBackgroundColor(),
});

export default styles;
