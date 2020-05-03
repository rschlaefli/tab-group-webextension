import React, { useState, useEffect } from 'react'
import {
  Container,
  FormGroup,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@material-ui/core'

import { performBrowserActionSafe } from '../lib/utils'
import optionsStorage from '../optionsStorage'

function Options(): React.ReactElement {
  const [enableHeuristics, setEnableHeuristics] = useState(false)
  const [openSidebarByDefault, setOpenSidebarByDefault] = useState(false)
  const [enableLogging, setEnableLogging] = useState(false)

  useEffect(() => {
    const getAll = async (): Promise<void> => {
      const options = await optionsStorage.getAll()
      setEnableHeuristics(options.enableHeuristics)
      setEnableLogging(options.debugLogging)
      setOpenSidebarByDefault(options.openSidebarByDefault)
    }
    getAll()
  }, [])

  const handleToggleCheckbox = (name: string, setter: Function, extra?: Function) => async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    await optionsStorage.set({ [name]: e.target.checked })
    if (extra) extra()
    setter(e.target.checked)
  }

  return (
    <Container>
      <FormControl component="fieldset">
        <FormLabel component="legend">Browser Extension</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={openSidebarByDefault}
                onChange={handleToggleCheckbox('openSidebarByDefault', setOpenSidebarByDefault)}
              />
            }
            label="Open the sidebar by default"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={enableLogging}
                onChange={handleToggleCheckbox('debugLogging', setEnableLogging)}
              />
            }
            label="Enable debug logging"
          />
        </FormGroup>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Heuristics Engine</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={enableHeuristics}
                onChange={handleToggleCheckbox(
                  'enableHeuristics',
                  setEnableHeuristics,
                  performBrowserActionSafe((browser) => browser.runtime.reload())
                )}
              />
            }
            label="Enable grouping heuristics"
          />
        </FormGroup>
      </FormControl>
    </Container>
  )
}

export default Options
