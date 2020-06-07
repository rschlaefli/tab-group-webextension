import React from 'react'

import '@src/styles/markdown.css'

interface IProps {
  content: string
  replace?: {
    key: string
    value: string
  }
}

function Markdown({ content, replace }: IProps): React.ReactElement {
  if (replace) {
    return (
      <div
        className="markdown"
        dangerouslySetInnerHTML={{
          __html: content.replace(new RegExp(replace?.key, 'g'), replace.value),
        }}
      />
    )
  }

  return <div className="markdown" dangerouslySetInnerHTML={{ __html: content }} />
}

export default Markdown
