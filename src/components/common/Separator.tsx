import React from 'react'

interface IProps {
  children: React.ReactNode
}

function Separator({ children }: IProps): React.ReactElement {
  return (
    <div className="px-2 text-xs font-medium text-gray-700 border-b border-gray-500 dark:text-gray-400">
      {children}
    </div>
  )
}

export default Separator
