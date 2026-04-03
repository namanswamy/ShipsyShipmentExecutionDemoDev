import { tokens } from 'src/design-system';
import { commonStyleSheet } from 'src/Library/CommonStyles';

const styles = (theme) => ({
  watchIcon: { '& :hover': { color: '#3797F7' } },
  parentDiv: {
    width: '99.5%', height: '95px', backgroundColor: tokens.colors.bgWhite,
    marginBottom: tokens.spacing.sm, border: '1px solid #F4F4F4',
    borderRadius: `${tokens.radius.md}px 0 0 ${tokens.radius.md}px`, cursor: 'pointer',
  },
  selectedShipment: {
    width: '100%', border: `2px solid ${tokens.colors.primaryDark}`,
    borderRight: `4px solid ${tokens.colors.primaryDark}`,
  },
  header: {
    height: 24, fontSize: tokens.fontSize.caption, backgroundColor: '#F5F0FF',
    borderTopLeftRadius: 3, display: 'flex', justifyContent: 'space-between',
    padding: `0px ${tokens.spacing.sm}px 0px ${tokens.spacing.md}px`,
  },
  headerLeft: { ...commonStyleSheet.flexRow },
  referenceNumber: {
    color: tokens.colors.primaryDark, fontSize: tokens.fontSize.small,
    fontWeight: tokens.fontWeight.semibold, width: 75,
  },
  internalNumber: { fontSize: 9, marginLeft: tokens.spacing.ms, marginRight: 10, width: 65 },
  mode: { ...commonStyleSheet.flexRow, marginLeft: tokens.spacing.ms, color: tokens.colors.text },
  type: { color: tokens.colors.text },
  blackDot: { backgroundColor: '#666666', width: 2, height: 2, margin: tokens.spacing.xs },
  supplierFFDiv: {
    color: '#000000', fontWeight: tokens.fontWeight.semibold, display: 'flex', alignItems: 'center',
  },
  supplierFFName: {
    maxWidth: 70, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
  },
  body: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    color: tokens.colors.text, padding: `0px ${tokens.spacing.sm}px 0px ${tokens.spacing.md}px`, height: 48,
  },
  bodyLeft: { display: 'flex', alignItems: 'center', width: 156 },
  bodyLeftDomestic: { display: 'flex', alignItems: 'center', width: 200 },
  originDestination: { display: 'flex', flexDirection: 'column', maxWidth: 48, marginRight: tokens.spacing.ms },
  originDestinationDomestic: { display: 'flex', flexDirection: 'column', maxWidth: 80, marginRight: tokens.spacing.ms },
  originDestinationCode: {
    fontSize: tokens.fontSize.small, color: tokens.colors.text, fontWeight: 'bold',
    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
  },
  originDestinationName: {
    fontSize: 8, color: '#666666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
  },
  ellipsis: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
  line: {
    backgroundColor: tokens.colors.textSecondary, width: tokens.spacing.lg,
    height: 1, marginBottom: tokens.spacing.ms, marginRight: tokens.spacing.ms,
  },
  bodyRight: { display: 'flex', justifyContent: 'space-between' },
  currentMilestone: {
    height: 26, ...commonStyleSheet.flexRow, justifyContent: 'space-between',
    padding: `6px ${tokens.spacing.ms}px`, borderRadius: 12, marginRight: tokens.spacing.sm,
    minWidth: 91, backgroundColor: '#FEF9E9', fontSize: tokens.fontSize.caption, fontWeight: 'bold',
  },
  tasks: {
    height: 26, ...commonStyleSheet.flexRow, justifyContent: 'space-between',
    padding: `6px ${tokens.spacing.ms}px`, marginRight: 15, width: 90,
    fontSize: tokens.fontSize.small, backgroundColor: '#EFFAF1', borderRadius: 12, color: tokens.colors.text,
  },
  tasksCompleted: { fontSize: tokens.fontSize.small, fontWeight: 'bold', marginRight: 2 },
  footer: {
    display: 'flex', justifyContent: 'space-between', fontSize: 8,
    paddingLeft: tokens.spacing.md, alignItems: 'flex-end',
  },
  cargoType: { color: '#000000', paddingBottom: 10, height: 22, display: 'flex' },
  alertMessage: {
    color: '#FFF', height: 16, ...commonStyleSheet.flexRow, fontStyle: 'italic',
    backgroundColor: '#F75555', padding: `0 ${tokens.spacing.ms}px`, borderRadius: '69px 0 0 0', marginBottom: 1,
  },
  apiResponseMessage: { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 100 },
  containerListLabel: {
    padding: '0px 5px', fontSize: '9px', color: '#3876EE', lineHeight: '12px', textDecoration: 'underline',
  },
  containerNumberLabel: {
    fontWeight: tokens.fontWeight.semibold, fontSize: tokens.fontSize.caption,
    lineHeight: '14px', color: tokens.colors.textSecondary, marginTop: '-4px', background: '#F5F5F5',
  },
  containerNumbers: {
    fontWeight: tokens.fontWeight.regular, fontSize: tokens.fontSize.caption,
    lineHeight: '14px', color: '#666666', display: 'flex', alignItems: 'center', paddingLeft: '10px',
  },
  customContainerNumberDropdown: {
    '& .ant-dropdown-menu': { borderBottom: '#3876EE solid 2px', maxHeight: '180px', overflow: 'scroll' },
  },
  dotMenu: {
    width: '15px', height: '14px', color: '#666666', marginTop: '-8px',
    fontWeight: tokens.fontWeight.regular, fontSize: tokens.fontSize.body,
  },
  cardHover: {
    '& .ant-checkbox-wrapper': { opacity: 0, transition: 'opacity 0.3s', display: 'none' },
    '&:hover': { '& .ant-checkbox-wrapper': { opacity: 1, transition: 'opacity 0.3s', display: 'block' } },
  },
});

export default styles;
