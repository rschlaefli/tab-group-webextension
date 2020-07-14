import React from 'react'
import { Container } from '@material-ui/core'

import Layout from '@src/components/common/Layout'
import Markdown from '@src/components/common/Markdown'
import FeatureOverview from '@src/docs/featureOverview/FeatureOverview.md'

function Features(): React.ReactElement {
  return (
    <Layout>
      <Container className="p-4" maxWidth="md">
        <div className="flex flex-col p-4 bg-gray-100 border border-gray-300 border-solid rounded shadow-xl dark:bg-gray-700 min-h-64 dark:border-none">
          <Markdown content={FeatureOverview} />
        </div>
      </Container>
    </Layout>
  )
}

export default Features
