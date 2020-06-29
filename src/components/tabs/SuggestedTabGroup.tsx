import React from 'react'

import TabGroup from './TabGroup'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'
import { openTabGroupAlias } from '@src/state/tabGroups'
import { openCurrentTabAlias } from '@src/state/currentTabs'
import {
  acceptSuggestedGroupAlias,
  discardSuggestedGroupAlias,
  discardSuggestedTabAlias,
} from '@src/state/suggestions'

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function SuggestedTabGroup({ selector }: IProps): React.ReactElement {
  const dispatch = useDispatch()

  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)

  const { id, name, tabs } = useSelector(selector)

  const handleOpenCurrentTab = (tabHash: string) => (): void => {
    dispatch(openCurrentTabAlias(tabHash))
  }

  const handleOpenTabGroup = (sourceGroupId: string) => (newWindow?: boolean) => () => {
    dispatch(openTabGroupAlias({ tabGroupId: sourceGroupId, newWindow }))
  }

  const handleAcceptSuggestion = (sourceGroupId: string) => () => {
    dispatch(acceptSuggestedGroupAlias(sourceGroupId))
  }

  const handleDiscardSuggestion = (sourceGroupId: string) => () => {
    dispatch(discardSuggestedGroupAlias(sourceGroupId))
  }

  const handleRemoveSuggestedTab = (sourceGroupId: string) => (targetTabHash: string) => () => {
    dispatch(discardSuggestedTabAlias({ sourceGroupId, targetTabHash }))
  }

  const extendedId = `suggest-${id}`

  return (
    <TabGroup
      isSuggested
      isDropDisabled
      isReadOnly
      currentTabs={tabHashes}
      key={extendedId}
      id={extendedId}
      name={name}
      tabs={tabs}
      onAcceptSuggestion={handleAcceptSuggestion(extendedId)}
      onDiscardSuggestion={handleDiscardSuggestion(extendedId)}
      onOpenCurrentTab={handleOpenCurrentTab}
      onOpenTabGroup={handleOpenTabGroup(extendedId)}
      onRemoveTab={handleRemoveSuggestedTab(extendedId)}
    />
  )
}

export default SuggestedTabGroup
