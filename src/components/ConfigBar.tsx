import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormControlLabel, Switch, Tooltip } from '@material-ui/core'
import { InfoRounded, ZoomOutMap, Settings, ChromeReaderModeSharp } from '@material-ui/icons'

import { RootState } from '@src/state/configureStore'
import {
  openOptionsPageAlias,
  openExtensionUIAlias,
  toggleFocusMode,
  toggleHeuristicsBackendAlias,
} from '@src/state/settings'
import { performBrowserActionSafe } from '@src/lib/utils'

function ConfigBar(): React.ReactElement {
  const dispatch = useDispatch()

  const focusModeEnabled = useSelector((state: RootState) => state.settings.isFocusModeEnabled)
  const heuristicsEnabled = useSelector(
    (state: RootState) => state.settings.isHeuristicsBackendEnabled
  )

  const handleOpenOptions = async (): Promise<void> => {
    dispatch(openOptionsPageAlias())
  }

  const handleOpenUI = async (): Promise<void> => {
    dispatch(openExtensionUIAlias())
  }

  const handlePinSidebar = async (): Promise<void> => {
    performBrowserActionSafe(async (browser) => {
      browser.runtime.sendMessage('PIN_SIDEBAR')
    })
  }

  const handleToggleFocusMode = async (): Promise<void> => {
    dispatch(toggleFocusMode())
  }

  const handleToggleHeuristics = async (): Promise<void> => {
    dispatch(toggleHeuristicsBackendAlias())
  }

  return (
    <div className="flex flex-row justify-between pb-2 dark:text-gray-100">
      <div className="flex flex-row items-center pl-2">
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
        <Tooltip
          title="Focus Mode: On opening of a tab group, close all tabs belonging to other groups"
          aria-label="Focus Mode: On opening of a tab group, close all tabs belonging to other groups"
        >
          <InfoRounded className="text-blue-400" fontSize="inherit" />
        </Tooltip>
      </div>

      <div className="flex flex-row items-center">
        {self == top && (
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
        )}
        {self != top && (
          <button
            className="mr-2 text-lg text-gray-600 dark:text-gray-100"
            onClick={handlePinSidebar}
            title="open group ui"
          >
            <ChromeReaderModeSharp fontSize="inherit" />
          </button>
        )}

        {self != top && (
          <button
            className="mr-2 text-lg text-gray-600 dark:text-gray-100"
            onClick={handleOpenUI}
            title="open group ui"
          >
            <ZoomOutMap fontSize="inherit" />
          </button>
        )}

        <button
          className="text-lg text-gray-600 dark:text-gray-100"
          onClick={handleOpenOptions}
          title="open settings"
        >
          <Settings fontSize="inherit" />
        </button>
      </div>
    </div>
  )
}

export default ConfigBar