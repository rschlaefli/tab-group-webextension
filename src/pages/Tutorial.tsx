import React, { useState, useEffect } from 'react'
import { Button, Container, Stepper, Step, StepLabel, Typography } from '@material-ui/core'

import optionsStorage from '../optionsStorage'

const STEPS = ['Extension Setup', 'Heuristics Setup', 'Data Collection']

function Tutorial(): React.ReactElement {
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    const getAll = async (): Promise<void> => {
      const options = await optionsStorage.getAll()
      setActiveStep(options.tutorialProgress)
    }
    getAll()
  }, [])

  const finalizeExtensionSettings = async (): Promise<void> => {
    await optionsStorage.set({ tutorialProgress: 1 })
    setActiveStep(1)
  }

  const finalizeHeuristicsSetup = async (): Promise<void> => {
    await optionsStorage.set({ tutorialProgress: 2 })
    setActiveStep(2)
  }

  const finalizeDataCollection = async (): Promise<void> => {
    await optionsStorage.set({ tutorialProgress: 3 })
    setActiveStep(3)
  }

  return (
    <Container>
      <div className="p-4 border border-gray-100 border-solid min-h-64">
        <Typography>Tutorial</Typography>

        {activeStep === 0 && (
          <div>
            <p>Tune the extension to your liking</p>
            <ul>
              <li>asdasd</li>
            </ul>
            <Button onClick={finalizeExtensionSettings}>Next Step</Button>
          </div>
        )}

        {activeStep === 1 && (
          <div>
            <p>Setup the heuristics engine on your local machine.</p>
            <ul>
              <li>setup steps...</li>
              <li>download the installer for your OS from xyz...</li>
              <li>run the installer</li>
              <li>restart the browser</li>
              <li>if everything works, the extension will show it HERE and THERE...</li>
            </ul>
            <Button onClick={(): void => setActiveStep(0)}>Previous Step</Button>
            <Button onClick={finalizeHeuristicsSetup}>Next Step</Button>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <p>Start browsing and we will collect data in the background!</p>
            <ul>
              <li>data can be viewed and censored here: xyz ...</li>
              <li>experimental procedures...</li>
              <li>you can modify your groups at will...</li>
            </ul>
            <Button onClick={(): void => setActiveStep(1)}>Previous Step</Button>
            <Button onClick={finalizeDataCollection}>Finish Tutorial</Button>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <p>You have finished the tutorial...</p>
            <p>Please send feedback to bla or fill the following form xyz...</p>
          </div>
        )}
      </div>
      <Stepper activeStep={activeStep}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Button></Button>
    </Container>
  )
}

export default Tutorial
