import React, { useState } from 'react'
import { ReorderableColumn, TableColumn } from '../models'

export function useColumnReorder<T>(
  isEnabled: boolean,
  columns: TableColumn<T>[],
  numPinnedColumns: number
): ReorderableColumn<T>[] | TableColumn<T>[] {
  const [currDraggingColumnIndex, setCurrDraggingColumnIndex] = useState<number>(-1)
  const [columnOrders, setColumnOrders] = useState<number[]>(
    Array.from(new Array(columns.length).keys())
  )

  function getHeaderDragDropProps(physicalColumnIndex: number) {
    function removeClasses(event: React.DragEvent<HTMLDivElement>) {
      event.currentTarget.classList.remove('draggedOver')
    }

    return {
      draggable: true,
      onMouseDown: () => setCurrDraggingColumnIndex(physicalColumnIndex),
      onMouseUp: () => setCurrDraggingColumnIndex(-1),
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
        const fromIndex = currDraggingColumnIndex
        const toIndex = physicalColumnIndex
        removeClasses(event)
        const newColumnOrders = [...columnOrders]
        newColumnOrders.splice(toIndex, 0, newColumnOrders.splice(fromIndex, 1)[0])
        setColumnOrders(newColumnOrders)
        setCurrDraggingColumnIndex(-1)
      },
    }
  }

  const orderedColumns = React.useMemo(
    () =>
      isEnabled
        ? columnOrders.map((columnIndex: number, i: number) => {
            const column = columns[columnIndex]
            return {
              ...column,
              reorderProps:
                columnIndex < numPinnedColumns ? undefined : getHeaderDragDropProps(i),
            }
          })
        : columns,
    [columns, columnOrders, currDraggingColumnIndex, isEnabled]
  )

  return orderedColumns
}
