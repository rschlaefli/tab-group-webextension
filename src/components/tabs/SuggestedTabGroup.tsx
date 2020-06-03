import React from 'react'

import TabGroup from './TabGroup'
import { useSelector } from 'react-redux'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function SuggestedTabGroup({ selector }: IProps): React.ReactElement {
  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)

  const { id, name, tabs } = useSelector(selector)

  return (
    <TabGroup
      isSuggested
      isDropDisabled
      isDragDisabled
      isReadOnly
      currentTabs={tabHashes}
      key={id}
      id={id}
      name={name}
      tabs={tabs}
    />
  )
}

export default SuggestedTabGroup
