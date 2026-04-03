import { tokens } from 'src/design-system';
import { mediaDown, mediaUp } from 'src/design-system/mixins/responsive';
import { commonStyleSheet } from 'src/Library/CommonStyles';

export const SEFiltersStyles = () => ({
  ...mediaDown(1400, { hideOnResize: { display: 'none' } }),
  ...mediaUp(1400, { hideOnResize: { display: 'flex', alignItems: 'center' } }),
  hideOnResize: {},
  filterLabel: {
    margin: `0 ${tokens.spacing.sm + 2}px 0 ${tokens.spacing.md}px`,
    display: 'flex', flexDirection: 'row', alignItems: 'center',
  },
  buttonStyle: {
    ...commonStyleSheet.flexRow, justifyContent: 'space-between',
    backgroundColor: tokens.colors.bgWhite, borderColor: tokens.colors.textTertiary,
    color: tokens.colors.text, marginRight: 5, borderRadius: 12, height: 24,
    fontSize: tokens.fontSize.caption, padding: `0 ${tokens.spacing.sm}px`,
    '&:hover': { backgroundColor: tokens.colors.bgSubtle, borderColor: tokens.colors.textTertiary, color: tokens.colors.text },
    '&:focus': { backgroundColor: tokens.colors.bgWhite, borderColor: tokens.colors.textTertiary, color: tokens.colors.text },
  },
  highlightedButtonStyle: {
    padding: `0 ${tokens.spacing.sm}px`, backgroundColor: tokens.colors.textSecondary,
    ...commonStyleSheet.flexRow, justifyContent: 'space-between',
    color: tokens.colors.bgWhite, borderColor: tokens.colors.textSecondary,
    marginRight: 5, borderRadius: 12, height: 24, fontSize: tokens.fontSize.caption,
    '&:hover': { backgroundColor: '#666666', color: tokens.colors.bgWhite, borderColor: '#666666' },
    '&:focus': { backgroundColor: tokens.colors.textSecondary, color: tokens.colors.bgWhite, borderColor: tokens.colors.textSecondary },
  },
  vertLine: { marginLeft: 15, borderLeft: '1px solid rgba(0, 0, 0, .2)', height: '25px' },
  filterForMoreFilters: {
    padding: `0 ${tokens.spacing.sm + 2}px 0 ${tokens.spacing.xxs + 1}px`,
    fontSize: tokens.fontSize.small, fontWeight: tokens.fontWeight.bold,
  },
  moreFilters: { marginLeft: 15, display: 'flex', alignItems: 'center', fontWeight: tokens.fontWeight.semibold, cursor: 'pointer' },
  moreFiltersSelected: { marginLeft: 15, display: 'flex', alignItems: 'center', fontWeight: tokens.fontWeight.semibold, cursor: 'pointer', color: tokens.colors.primaryDark },
  resetFilter: { display: 'flex', alignItems: 'center', padding: '0px 25px 0px 20px', color: tokens.colors.error, cursor: 'pointer' },
  myTaskQuickFilterDropdown: {
    width: '120px', color: `${tokens.colors.textSecondary} !important`,
    borderColor: '#99999900', fontSize: tokens.fontSize.caption,
    maxHeight: '22px !important', whiteSpace: 'nowrap', overflow: 'hidden',
    maxWidth: '120px', textOverflow: 'ellipsis', cursor: 'default',
    backgroundColor: `${tokens.colors.bgWhite} !important`,
  },
  myTaskQuickFilterMenuItem: {
    fontSize: tokens.fontSize.caption, fontWeight: tokens.fontWeight.regular, lineHeight: '14px', paddingRight: '5px',
    '& div': { display: 'grid', alignItems: 'center', justifyContent: 'space-between', gridTemplateColumns: '100px max-content', columnGap: '10px' },
    '& span': { whiteSpace: 'nowrap', maxWidth: '170px', textOverflow: 'ellipsis' },
  },
  emptyDiv: {
    width: '120px', position: 'absolute', height: '22px', zIndex: '1',
    textAlign: 'end', border: `solid 1px ${tokens.colors.textTertiary}`, borderRadius: '12px',
  },
  crossIcon: { position: 'absolute', right: '0px', zIndex: '1', marginRight: '6px', marginTop: '6px' },
  mySortMenuItem: { fontSize: tokens.fontSize.caption, fontWeight: tokens.fontWeight.regular, lineHeight: '14px', padding: '1px 5px 1px 8px' },
  sortMenuItemContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '5px' },
  checkIcon: { color: tokens.colors.primaryDark, padding: '5px' },
  sortTypeIcons: { display: 'flex', flexDirection: 'row' },
  sortbyTextlabel: { paddingRight: '25px' },
  arrowIcon: { fontSize: tokens.fontSize.caption, lineHeight: 1, cursor: 'pointer', padding: '8px' },
  activeArrow: { color: tokens.colors.primaryDark },
  dropdownWrapper: { position: 'relative', width: '120px' },
});
