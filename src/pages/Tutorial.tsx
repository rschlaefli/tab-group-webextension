import React from 'react'
import { Button, Stepper, Step, StepLabel, Typography, Container } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import Layout from '@src/components/common/Layout'
import { RootState } from '@src/state/configureStore'
import { updateTutorialProgress } from '@src/state/settings'

const STEPS = ['Extension Setup', 'Heuristics Setup', 'Data Collection']

function Tutorial(): React.ReactElement {
  const dispatch = useDispatch()

  const activeStep = useSelector((state: RootState) => state.settings.tutorialProgress)
  console.log(activeStep)

  return (
    <Layout>
      <Container>
        <div className="p-4 border border-gray-100 border-solid min-h-64 dark:border-none">
          <Typography>Tutorial</Typography>

          {activeStep === 0 && (
            <div>
              <p>Tune the extension to your liking</p>
              <ul>
                <li>asdasd</li>
              </ul>
              <Button onClick={() => dispatch(updateTutorialProgress(1))}>Next Step</Button>
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
              <Button onClick={() => () => dispatch(updateTutorialProgress(0))}>
                Previous Step
              </Button>
              <Button onClick={() => dispatch(updateTutorialProgress(2))}>Next Step</Button>
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
              <Button onClick={() => dispatch(updateTutorialProgress(1))}>Previous Step</Button>
              <Button onClick={() => dispatch(updateTutorialProgress(3))}>Finish Tutorial</Button>
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
      </Container>
    </Layout>
  )
}

export default Tutorial
