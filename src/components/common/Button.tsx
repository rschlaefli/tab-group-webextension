import React from 'react'

interface IProps {
  children: React.ReactChild
  onClick: () => void
}

function Button({ children, onClick }: IProps): React.ReactElement {
  return (
    <button
      className="p-1 text-white bg-blue-600 border border-blue-800 border-solid rounded"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
