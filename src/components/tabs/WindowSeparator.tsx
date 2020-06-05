import React from 'react'

interface IProps {
  index: number
}

function WindowSeparator({ index }: IProps): React.ReactElement {
  return (
    <div className="px-2 text-xs font-medium text-gray-700 border-b border-gray-500 dark:text-gray-400">
      Window {index + 1}
    </div>
  )
}

export default WindowSeparator
