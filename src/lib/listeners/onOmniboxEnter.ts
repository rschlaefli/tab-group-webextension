import { openTabGroupAlias } from '@src/state/tabGroups'

export default function onOmniboxEnter({ dispatch }) {
  return function onOmniboxEnterListener(tabGroupId): void {
    dispatch(openTabGroupAlias({ tabGroupId }))
  }
}
