import React from 'react'
import {
  Button,
  Stepper,
  Step,
  Typography,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  StepLabel,
} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import Layout from '@src/components/common/Layout'
import Markdown from '@src/components/common/Markdown'
import { RootState } from '@src/state/configureStore'
import { updateTutorialProgress } from '@src/state/settings'
import { useBrowserAndOS } from '@src/lib/utils'
import TUTORIAL_CONTENTS from '@src/docs/tutorial'

const STEPS = ['Extension Setup', 'Heuristics Setup', 'Data Collection']

function Tutorial(): React.ReactElement {
  const dispatch = useDispatch()

  // const activeStep = useSelector((state: RootState) => state.settings.tutorialProgress)

  const activeStep = 1

  const { browser, os, setBrowser, setOS } = useBrowserAndOS()

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
              <Markdown content={TUTORIAL_CONTENTS[`${browser}_${os}`]} />

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

        <div>
          <FormControl>
            <InputLabel>Browser</InputLabel>
            <Select value={browser} onChange={(e: any) => setBrowser(e.target.value)}>
              <MenuItem value="Chrome">Google Chrome</MenuItem>
              <MenuItem value="Firefox">Mozilla Firefox</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>OS</InputLabel>
            <Select value={os} onChange={(e: any) => setOS(e.target.value)}>
              <MenuItem value="Windows">Windows</MenuItem>
              <MenuItem value="Mac OS">Mac OS</MenuItem>
              <MenuItem value="Linux">Linux</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Container>
    </Layout>
  )
}

export default Tutorial
