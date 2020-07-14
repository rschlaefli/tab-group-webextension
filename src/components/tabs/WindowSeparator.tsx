import React from 'react'

import Separator from '../common/Separator'

interface IProps {
  index: number
}

function WindowSeparator({ index }: IProps): React.ReactElement {
  return <Separator>Window {index + 1}</Separator>
}

export default WindowSeparator
