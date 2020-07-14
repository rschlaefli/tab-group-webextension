import React, { useState } from 'react'
import Rating, { IconContainerProps } from '@material-ui/lab/Rating'
import { useSelector, useDispatch } from 'react-redux'
import { ButtonGroup, MenuItem, Popover, Button, Typography } from '@material-ui/core'
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentSatisfied,
  SentimentSatisfiedAlt,
  SentimentVerySatisfied,
} from '@material-ui/icons'

import TabGroup from './TabGroup'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'
import { openTabGroupAlias } from '@src/state/tabGroups'
import {
  acceptSuggestedGroupAlias,
  discardSuggestedGroupAlias,
  discardSuggestedTabAlias,
} from '@src/state/suggestions'
import SuggestedTab from '../tabs/SuggestedTab'

const customIcons: { [index: string]: { icon: React.ReactElement; label: string } } = {
  1: {
    icon: <SentimentVeryDissatisfied />,
    label: 'Very Dissatisfied',
  },
  2: {
    icon: <SentimentDissatisfied />,
    label: 'Dissatisfied',
  },
  3: {
    icon: <SentimentSatisfied />,
    label: 'Neutral',
  },
  4: {
    icon: <SentimentSatisfiedAlt />,
    label: 'Satisfied',
  },
  5: {
    icon: <SentimentVerySatisfied />,
    label: 'Very Satisfied',
  },
}

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props
  return <span {...other}>{customIcons[value].icon}</span>
}

const REASONS = {
  OTHER: 'OTHER',
  WRONG: 'WRONG',
  NOT_USEFUL: 'NOT_USEFUL',
}

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function SuggestedGroup({ selector }: IProps): React.ReactElement {
  const [rating, setRating] = useState(3)
  const [reason, setReason] = useState(REASONS.OTHER)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const dispatch = useDispatch()

  const { id, name, tabs } = useSelector(selector)

  const handleOpenTabGroup = (sourceGroupId: string) => (newWindow?: boolean) => () => {
    dispatch(openTabGroupAlias({ tabGroupId: sourceGroupId, newWindow }))
  }

  const handleAcceptSuggestion = (sourceGroupId: string) => () => {
    dispatch(acceptSuggestedGroupAlias(sourceGroupId))
  }

  const handleDiscardSuggestion = (sourceGroupId: string, rating?: number, reason?: string) => {
    dispatch(discardSuggestedGroupAlias({ sourceGroupId, rating, reason }))
    setAnchorEl(null)
  }

  const handleRemoveSuggestedTab = (sourceGroupId: string, targetTabHash: string) => () => {
    dispatch(discardSuggestedTabAlias({ sourceGroupId, targetTabHash }))
  }

  const open = Boolean(anchorEl)
  const extendedId = `suggest-${id}`
  const popId = open ? 'simple-popover' : undefined

  const contextMenuItems = [
    <MenuItem dense key="openGroup" onClick={handleOpenTabGroup(extendedId)()}>
      Open Tab Group
    </MenuItem>,
    <MenuItem dense key="openGroupInWindow" onClick={handleOpenTabGroup(extendedId)(true)}>
      Open Tab Group in New Window
    </MenuItem>,
    <MenuItem dense key="save" onClick={handleAcceptSuggestion(extendedId)}>
      Save Suggestion
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
              <TabGroup.DiscardGroup onDiscardSuggestion={(e) => setAnchorEl(e.currentTarget)} />
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
          <Popover
            id={popId}
            open={open}
            anchorEl={anchorEl}
            onClose={() => handleDiscardSuggestion(extendedId, rating, reason)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <div className="flex flex-col items-center p-3">
              <Typography className="pb-2">How appropriate was this suggestion?</Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue as number)}
                className="pb-2"
                getLabelText={(value: number) => customIcons[value].label}
                IconContainerComponent={IconContainer}
              />
              <Typography className="pb-2">Why are you discarding it?</Typography>
              <ButtonGroup fullWidth className="pb-2" orientation="vertical">
                <Button
                  color={reason === REASONS.WRONG ? 'primary' : undefined}
                  onClick={() => setReason(REASONS.WRONG)}
                >
                  Wrongly Grouped
                </Button>
                <Button
                  color={reason === REASONS.NOT_USEFUL ? 'primary' : undefined}
                  onClick={() => setReason(REASONS.NOT_USEFUL)}
                >
                  Not Useful At This Time
                </Button>
                <Button
                  color={reason === REASONS.OTHER ? 'primary' : undefined}
                  onClick={() => setReason(REASONS.OTHER)}
                >
                  Other Reason
                </Button>
              </ButtonGroup>
              <Button
                fullWidth
                color="primary"
                variant="contained"
                onClick={() => handleDiscardSuggestion(extendedId, rating, reason)}
              >
                Do It!
              </Button>
            </div>
          </Popover>
        </>
      )}
    </TabGroup>
  )
}

export default SuggestedGroup
