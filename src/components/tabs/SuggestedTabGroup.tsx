import React from 'react'

import TabGroup from './TabGroup'
import { useSelector } from 'react-redux'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'

interface IProps {
  selector: (state: RootState) => ITabGroup
  onAcceptSuggestion: () => void
  onDiscardSuggestion: () => void
}

function SuggestedTabGroup({
  selector,
  onAcceptSuggestion,
  onDiscardSuggestion,
}: IProps): React.ReactElement {
  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)

  const { id, name, tabs } = useSelector(selector)

  return (
    <TabGroup
      isSuggested
      isDropDisabled
      isReadOnly
      currentTabs={tabHashes}
      key={`suggest-${id}`}
      id={`suggest-${id}`}
      name={name}
      tabs={tabs}
      onAcceptSuggestion={onAcceptSuggestion}
      onDiscardSuggestion={onDiscardSuggestion}
    />
  )
}

export default SuggestedTabGroup
