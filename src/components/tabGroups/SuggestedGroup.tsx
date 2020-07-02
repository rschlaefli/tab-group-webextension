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
import SuggestedTab from '../tabs/SuggestedTab'

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function SuggestedGroup({ selector }: IProps): React.ReactElement {
  const dispatch = useDispatch()

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

  const handleRemoveSuggestedTab = (sourceGroupId: string, targetTabHash: string) => () => {
    dispatch(discardSuggestedTabAlias({ sourceGroupId, targetTabHash }))
  }

  const extendedId = `suggest-${id}`

  return (
    <TabGroup>
      {({ handleOpenContextMenu }) => (
        <>
          <TabGroup.Header onOpenContextMenu={handleOpenContextMenu}>
            <TabGroup.Title isReadOnly value={name} />
            <div className="flex flex-row">
              <TabGroup.OpenGroup onOpenTabGroup={handleOpenTabGroup(extendedId)} />
              <TabGroup.DiscardGroup onDiscardSuggestion={handleDiscardSuggestion(extendedId)} />
              <TabGroup.AcceptGroup onAcceptSuggestion={handleAcceptSuggestion(extendedId)} />
            </div>
          </TabGroup.Header>

          <TabGroup.Tabs isReadOnly id={extendedId}>
            {tabs.map((tab, ix) => {
              const uniqueId = `${extendedId}-${tab.hash}`
              return (
                <SuggestedTab
                  key={uniqueId}
                  id={uniqueId}
                  index={ix}
                  title={tab.title}
                  url={tab.url}
                  onDiscardTab={handleRemoveSuggestedTab(extendedId, tab.hash as string)}
                />
              )
            })}
          </TabGroup.Tabs>
        </>
      )}
    </TabGroup>
  )
}

export default SuggestedGroup
