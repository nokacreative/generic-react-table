import React from 'react'

type Props = {
  onMouseDown: (e: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>) => void
  isActive: boolean
}

export const ColumnResizer = ({ onMouseDown, isActive }: Props) => (
  <div
    className={`column-resizer ${isActive ? 'active' : ''}`}
    onMouseDown={onMouseDown}
  />
)
