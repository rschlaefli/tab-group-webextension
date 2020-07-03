import React from 'react'

import TabGroup from './TabGroup'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'
import { openTabGroupAlias } from '@src/state/tabGroups'
import {
  acceptSuggestedGroupAlias,
  discardSuggestedGroupAlias,
  discardSuggestedTabAlias,
} from '@src/state/suggestions'
import SuggestedTab from '../tabs/SuggestedTab'
import { MenuItem } from '@material-ui/core'

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function SuggestedGroup({ selector }: IProps): React.ReactElement {
  const dispatch = useDispatch()

  const { id, name, tabs } = useSelector(selector)

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

  const contextMenuItems = [
    <MenuItem dense key="openGroup" onClick={handleOpenTabGroup(extendedId)()}>
      Open Tab Group
    </MenuItem>,
    <MenuItem dense key="openGroupInWindow" onClick={handleOpenTabGroup(extendedId)(true)}>
      Open Tab Group in New Window
    </MenuItem>,
    <MenuItem dense key="remove" onClick={handleAcceptSuggestion(extendedId)}>
      Save Suggestion
    </MenuItem>,
    <MenuItem dense key="remove" onClick={handleDiscardSuggestion(extendedId)}>
      Discard Suggestion
    </MenuItem>,
  ]

  return (
    <TabGroup contextMenuItems={contextMenuItems}>
      {({ handleOpenContextMenu }) => (
        <>
          <TabGroup.Header onOpenContextMenu={handleOpenContextMenu}>
            <TabGroup.Title isReadOnly value={name} />
            <div className="flex flex-row">
              <TabGroup.OpenGroup onOpenTabGroup={handleOpenTabGroup(extendedId)()} />
              <TabGroup.AcceptGroup onAcceptSuggestion={handleAcceptSuggestion(extendedId)} />
              <TabGroup.DiscardGroup onDiscardSuggestion={handleDiscardSuggestion(extendedId)} />
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
