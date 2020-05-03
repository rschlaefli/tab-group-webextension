import React, { useState, useEffect } from 'react'
import { FormGroup, Checkbox, FormControlLabel, FormControl, FormLabel } from '@material-ui/core'

import optionsStorage from '../optionsStorage'

function Options(): React.ReactElement {
  const [enableHeuristics, setEnableHeuristics] = useState(false)
  const [openSidebarByDefault, setOpenSidebarByDefault] = useState(false)

  useEffect(() => {
    const getAll = async (): Promise<void> => {
      const options = await optionsStorage.getAll()
      setEnableHeuristics(options.enableHeuristics)
      setOpenSidebarByDefault(options.openSidebarByDefault)
    }
    getAll()
  }, [])

  const handleToggleCheckbox = (name: string, setter: Function) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    optionsStorage.set({ [name]: e.target.checked })
    setter(e.target.checked)
  }

  return (
    <div className="p-4">
      <FormControl component="fieldset">
        <FormLabel component="legend">WebExtension</FormLabel>
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
        </FormGroup>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Heuristics Engine</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={enableHeuristics}
                onChange={handleToggleCheckbox('enableHeuristics', setEnableHeuristics)}
              />
            }
            label="Enable grouping heuristics"
          />
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default Options
