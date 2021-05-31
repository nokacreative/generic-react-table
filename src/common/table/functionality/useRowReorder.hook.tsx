import React, { useState } from 'react'

export function useRowReorder<T>(
  isEnabled: boolean,
  data: T[],
  onReorder: undefined | ((row: T, fromRowIndex: number, toRowIndex: number) => void)
): T[] {
  const [currDraggingRowIndex, setCurrDraggingRowIndex] = useState<number>(-1)
  const [rowOrders, seRowOrders] = useState<number[]>(
    Array.from(new Array(data.length).keys())
  )

  function getMoveIndicatorDragDropProps(physicalRowIndex: number) {
    return {
      draggable: true,
      onMouseDown: () => setCurrDraggingRowIndex(physicalRowIndex),
      onMouseUp: () => setCurrDraggingRowIndex(-1),
    }
  }

  function getTableRowDragDropProps(physicalRowIndex: number) {
    function removeClasses(event: React.DragEvent<HTMLDivElement>) {
      event.currentTarget.classList.remove('draggedOver')
    }

    return {
      onDragEnter: (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.add('draggedOver')
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.dropEffect = 'move'
      },
      onDragLeave: removeClasses,
      onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
        event.stopPropagation()
        event.preventDefault()
      },
      onDrop: (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        const fromIndex = currDraggingRowIndex
        const toIndex = physicalRowIndex
        removeClasses(event)
        const newRowOrders = [...rowOrders]
        newRowOrders.splice(toIndex, 0, newRowOrders.splice(fromIndex, 1)[0])
        seRowOrders(newRowOrders)
        setCurrDraggingRowIndex(-1)
        if (onReorder) {
          onReorder(data[physicalRowIndex], fromIndex, toIndex)
        }
      },
    }
  }

  const orderedRows = React.useMemo(
    () =>
      isEnabled
        ? rowOrders.map((rowIndex: number, i: number) => {
            const row = data[rowIndex]
            return {
              ...row,
              reorderProps: {
                indicator: getMoveIndicatorDragDropProps(i),
                row: getTableRowDragDropProps(i),
              },
            }
          })
        : data,
    [data, rowOrders, currDraggingRowIndex, isEnabled]
  )

  return orderedRows
}
