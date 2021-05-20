import { useState, useEffect, useRef } from 'react'

import './styles.scss'
import { ColumnResizeData } from '../../models'

const LEFT_MOUSE_BUTTON = 0
const INVALID_INDEX = -1

export function useColumnResize() {
  const isMounted = useRef<boolean>(false)

  const [resizeStartX, setResizeStartX] = useState<number>(0)
  const [columnResizeData, setColumnResizeData] = useState<ColumnResizeData>({})
  const [activeResizerIndex, setActiveResizerIndex] = useState<number>(INVALID_INDEX)

  function calculateColumnWidth(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const handledColumn = e.currentTarget.previousElementSibling as HTMLElement
    return handledColumn ? handledColumn.offsetWidth : 0
  }

  function onMouseDown(columnIndex: number) {
    return (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.button !== LEFT_MOUSE_BUTTON) return
      e.stopPropagation()
      e.preventDefault()
      setResizeStartX(e.pageX)
      if (!(columnIndex in columnResizeData)) {
        setColumnResizeData({
          ...columnResizeData,
          [columnIndex]: {
            delta: 0,
            startingWidth: calculateColumnWidth(e),
          },
        })
      }
      setActiveResizerIndex(columnIndex)
    }
  }

  function onMouseUp(e: MouseEvent) {
    if (e.button !== LEFT_MOUSE_BUTTON) return
    e.stopPropagation()
    e.preventDefault()
    if (isMounted.current) {
      setActiveResizerIndex(INVALID_INDEX)
    }
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (activeResizerIndex === INVALID_INDEX) return
    e.stopPropagation()
    e.preventDefault()
    setColumnResizeData({
      ...columnResizeData,
      [activeResizerIndex]: {
        delta: e.pageX - resizeStartX,
        startingWidth: columnResizeData[activeResizerIndex].startingWidth,
      },
    })
  }

  useEffect(() => {
    isMounted.current = true
    if (isMounted.current) {
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      isMounted.current = false
    }
  }, [])

  return {
    onMouseDown,
    onMouseMove,
    columnResizeData,
    activeResizerIndex,
  }
}
