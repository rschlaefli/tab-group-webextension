import React, { useState, useEffect } from 'react'
import {
  Container,
  FormGroup,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
} from '@material-ui/core'

import { performBrowserActionSafe } from '../lib/utils'
import Layout from '../lib/Layout'

function Options(): React.ReactElement {
  const [enableHeuristics, setEnableHeuristics] = useState(false)
  const [enableLogging, setEnableLogging] = useState(false)
  const [tutorialProgress, setTutorialProgress] = useState(-1)

  useEffect(() => {
    const getAll = async (): Promise<void> => {
      await performBrowserActionSafe(async (browser) => {
        const backgroundWindow = await browser.runtime.getBackgroundPage()
        const options = await backgroundWindow.optionsSync.getAll()
        setEnableHeuristics(options.enableHeuristics)
        setEnableLogging(options.debugLogging)
        setTutorialProgress(options.tutorialProgress)
      })
    }
    getAll()
  }, [])

  const resetTutorialProgress = async (): Promise<void> => {
    await performBrowserActionSafe(async (browser) => {
      const backgroundWindow = await browser.runtime.getBackgroundPage()
      await backgroundWindow.optionsSync.set({ tutorialProgress: 0 })
      setTutorialProgress(0)
    })
  }

  const handleToggleCheckbox = (
    name: string,
    setter: (newValue: any) => void,
    extra?: () => void
  ) => async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const checkValue = e.target.checked
    await performBrowserActionSafe(async (browser) => {
      const backgroundWindow = await browser.runtime.getBackgroundPage()
      await backgroundWindow.optionsSync.set({ [name]: checkValue })
      setter(checkValue)
      if (extra) extra()
    })
  }

  const reloadExtension = async (): Promise<void> =>
    performBrowserActionSafe((browser) => browser.runtime.reload())

  return (
    <Layout>
      <Container>
        <FormControl component="fieldset">
          <FormLabel component="legend">Browser Extension</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableLogging}
                  onChange={handleToggleCheckbox('debugLogging', setEnableLogging, reloadExtension)}
                />
              }
              label="Enable debug logging"
            />
            <Button
              disabled={tutorialProgress === 0}
              onClick={(): Promise<void> => resetTutorialProgress()}
            >
              Reset tutorial progress
            </Button>
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
                    reloadExtension
                  )}
                />
              }
              label="Enable grouping heuristics"
            />
          </FormGroup>
        </FormControl>
      </Container>
    </Layout>
  )
}

export default Options
