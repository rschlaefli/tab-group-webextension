import React from 'react'
import { Container } from '@material-ui/core'

import Layout from '@src/components/common/Layout'
import Markdown from '@src/components/common/Markdown'
import FeatureOverview from '@src/docs/featureOverview/FeatureOverview.md'

function Features(): React.ReactElement {
  return (
    <Layout>
      <Container>
        <div className="p-4">
          <Markdown content={FeatureOverview} />
        </div>
      </Container>
    </Layout>
  )
}

export default Features
