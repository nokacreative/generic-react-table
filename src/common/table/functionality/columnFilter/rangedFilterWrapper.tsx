import React from 'react'

type Props = {
  fromFilter: JSX.Element
  toFilter: JSX.Element
  extraClassName?: string
}

export const RangedFilterWrapper = ({ fromFilter, toFilter, extraClassName }: Props) => (
  <div className={`table-ranged-filter-wrapper ${extraClassName || ''}`}>
    <div>{fromFilter}</div>
    <div>{toFilter}</div>
  </div>
)
