import { closeTabGroupAlias, openTabGroup, closeTabGroup, openTabGroupAlias } from './tabGroups'
import {
  openCurrentTabAlias,
  openCurrentTab,
  closeCurrentTabAlias,
  closeCurrentTab,
} from './currentTabs'

export default {
  [closeTabGroupAlias.type]: closeTabGroup,
  [openTabGroupAlias.type]: openTabGroup,
  [openCurrentTabAlias.type]: openCurrentTab,
  [closeCurrentTabAlias.type]: closeCurrentTab,
}
