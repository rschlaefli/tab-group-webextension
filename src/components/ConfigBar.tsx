import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormControlLabel, Switch, Tooltip, Button, IconButton } from '@material-ui/core'
import {
  InfoRounded,
  ZoomOutMap,
  Settings,
  ChromeReaderModeSharp,
  RadioButtonUncheckedRounded,
  CheckCircleRounded,
  PauseCircleOutline,
  HelpOutline,
} from '@material-ui/icons'
import clsx from 'clsx'

import { RootState } from '@src/state/configureStore'
import {
  openOptionsPageAlias,
  openExtensionUIAlias,
  toggleFocusMode,
  toggleHeuristicsBackendAlias,
} from '@src/state/settings'
import { performBrowserActionSafe } from '@src/lib/utils'
import { HEURISTICS_STATUS } from '@src/types/Extension'

const STATUS_DESCRIPTION = {
  RUNNING: 'The heuristics engine is running. Click to pause processing.',
  STOPPED: 'The heuristics engine has been stopped/paused. Click to resume processing.',
  FAILED: 'The heuristics engine could not be started. Try restarting your browser.',
  UNKNOWN: 'The status of the heuristics engine could not be determined.',
}

interface IProps {
  withFocusMode?: boolean
}

function ConfigBar({ withFocusMode }: IProps): React.ReactElement {
  const dispatch = useDispatch()

  const focusModeEnabled = useSelector((state: RootState) => state.settings.isFocusModeEnabled)
  const heuristicsEnabled = useSelector(
    (state: RootState) => state.settings.isHeuristicsBackendEnabled
  )
  const heuristicsStatus = useSelector((state: RootState) => state.settings.heuristicsStatus)

  const handleOpenOptions = () => {
    dispatch(openOptionsPageAlias())
  }

  const handleOpenUI = () => {
    dispatch(openExtensionUIAlias())
  }

  const handlePinSidebar = () => {
    performBrowserActionSafe(async (browser) => {
      browser.runtime.sendMessage('PIN_SIDEBAR')
    })
  }

  const handleToggleFocusMode = () => {
    dispatch(toggleFocusMode())
  }

  const handleToggleHeuristics = () => {
    dispatch(toggleHeuristicsBackendAlias())
  }

  const handleToggleHeuristicsProcessing = () => {
    if (heuristicsEnabled) {
      if (heuristicsStatus === HEURISTICS_STATUS.STOPPED) {
        performBrowserActionSafe(async (browser) => {
          browser.runtime.sendMessage('RESUME_PROCESSING')
        })
      } else if (heuristicsStatus === HEURISTICS_STATUS.RUNNING) {
        performBrowserActionSafe(async (browser) => {
          browser.runtime.sendMessage('PAUSE_PROCESSING')
        })
      }
    }
  }

  return (
    <div className="flex flex-col pb-2 md:justify-between md:flex-row dark:text-gray-100">
      <div className="flex flex-row items-center justify-between pl-2 md:order-2">
        <div className="flex flex-row items-center mr-4">
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={heuristicsEnabled}
                onChange={handleToggleHeuristics}
                name="heuristicsEngineEnabled"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
            }
            label="Heuristics"
          />
          <div className="flex items-center text-lg">
            {heuristicsEnabled ? (
              <Tooltip
                title={`Heuristics Status: ${STATUS_DESCRIPTION[heuristicsStatus ?? 'UNKNOWN']}`}
                aria-label={`Heuristics Status: ${heuristicsStatus}`}
              >
                {heuristicsStatus === 'STOPPED' ? (
                  <PauseCircleOutline
                    className="text-gray-500 cursor-pointer"
                    fontSize="inherit"
                    onClick={handleToggleHeuristicsProcessing}
                  />
                ) : (
                  <CheckCircleRounded
                    className={clsx(
                      'cursor-pointer',
                      heuristicsStatus === 'RUNNING' && 'text-green-500',
                      heuristicsStatus === 'FAILED' && 'text-red-500',
                      !heuristicsStatus && 'text-gray-500'
                    )}
                    fontSize="inherit"
                    onClick={handleToggleHeuristicsProcessing}
                  />
                )}
              </Tooltip>
            ) : (
              <RadioButtonUncheckedRounded className="text-lg text-grey" fontSize="inherit" />
            )}
          </div>
        </div>

        <span className="flex items-center">
          {self != top && self.name !== 'New Tab' && (
            <button
              className="mr-2 text-lg text-gray-600 dark:text-gray-100"
              onClick={handlePinSidebar}
              title="open group ui"
            >
              <ChromeReaderModeSharp fontSize="inherit" />
            </button>
          )}

          {self != top && self.name !== 'New Tab' && (
            <button
              className="mr-2 text-lg text-gray-600 dark:text-gray-100"
              onClick={handleOpenUI}
              title="open group ui"
            >
              <ZoomOutMap fontSize="inherit" />
            </button>
          )}

          <button
            className="flex items-center text-lg text-gray-600 dark:text-gray-100"
            onClick={handleOpenOptions}
            title="open settings"
          >
            <Settings fontSize="inherit" />
          </button>
        </span>
      </div>

      {withFocusMode ? (
        <div className="flex flex-row items-center pl-2 md:order-1">
          <Tooltip
            title="Focus Mode: On opening of a tab group, close all tabs belonging to other groups"
            aria-label="Focus Mode: On opening of a tab group, close all tabs belonging to other groups"
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={focusModeEnabled}
                  onChange={handleToggleFocusMode}
                  name="focusModeEnabled"
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              }
              label="Focus Mode"
            />
          </Tooltip>
          <IconButton
            color="primary"
            href="features.html"
            target="_blank"
            size="small"
            title="Documentation"
          >
            <HelpOutline fontSize="inherit" />
          </IconButton>
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}

export default ConfigBar
