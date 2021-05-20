import React from 'react'

type Props = {
  label?: string
  isDiabled?: boolean
  gotoIndex: number
  currentPageIndex: number
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>
}

import './styles.scss'

export const PageNavButton = ({
  label,
  isDiabled,
  gotoIndex,
  currentPageIndex,
  setCurrentPageIndex,
}: Props) => {
  const isActive = currentPageIndex === gotoIndex
  return (
    <button
      className={`table-page-nav-button ${isActive ? 'active' : ''}`}
      onClick={() => setCurrentPageIndex(gotoIndex)}
      disabled={isDiabled || isActive}
    >
      {label || gotoIndex + 1}
    </button>
  )
}
