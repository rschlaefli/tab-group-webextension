import React, { useState } from 'react'

import DocStepper from '@src/components/tutorial/DocStepper'

import Introduction from '@src/docs/dataSubmission/Introduction.md'
import Preparation from '@src/docs/dataSubmission/Preparation.md'
import Review from '@src/docs/dataSubmission/Review.md'
import Submit from '@src/docs/dataSubmission/Submit.md'
import Markdown from '@src/components/common/Markdown'

const STEPS = ['Introduction', 'Compile', 'Review', 'Submit']

function Data(): React.ReactElement {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <DocStepper activeStep={activeStep} steps={STEPS}>
      <DocStepper.Step activeStep={activeStep} currentStep={0} hasNext onChangeStep={setActiveStep}>
        <Markdown content={Introduction} />
      </DocStepper.Step>
      <DocStepper.Step
        activeStep={activeStep}
        currentStep={1}
        hasNext
        hasPrev
        onChangeStep={setActiveStep}
      >
        <Markdown content={Preparation} />
      </DocStepper.Step>
      <DocStepper.Step
        activeStep={activeStep}
        currentStep={2}
        hasPrev
        hasNext
        onChangeStep={setActiveStep}
      >
        <Markdown content={Review} />
      </DocStepper.Step>
      <DocStepper.Step activeStep={activeStep} currentStep={3} hasPrev onChangeStep={setActiveStep}>
        <Markdown content={Submit} />
      </DocStepper.Step>
    </DocStepper>
  )
}

export default Data
