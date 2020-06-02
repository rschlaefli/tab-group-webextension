import React, { useState } from 'react'

interface IMousePosition {
  mouseX: null | number
  mouseY: null | number
}

const initialMousePosition = {
  mouseX: null,
  mouseY: null,
}

function useContextMenu(): any {
  const [mousePosition, setMousePosition] = useState<IMousePosition>(initialMousePosition)

  const handleOpenContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setMousePosition({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    })
  }

  const handleCloseContextMenu = (): void => {
    setMousePosition(initialMousePosition)
  }

  return {
    isContextMenuOpen: mousePosition.mouseY !== null,
    contextAnchorPosition:
      mousePosition.mouseY !== null && mousePosition.mouseX !== null
        ? { top: mousePosition.mouseY, left: mousePosition.mouseX }
        : undefined,
    handleOpenContextMenu,
    handleCloseContextMenu,
  }
}

export default useContextMenu
