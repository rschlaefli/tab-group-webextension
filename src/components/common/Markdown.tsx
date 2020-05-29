import React from 'react'

import '@src/styles/markdown.css'

interface IProps {
  content: string
}

function Markdown({ content }: IProps): React.ReactElement {
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: content }} />
}

export default Markdown
