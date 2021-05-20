import React from 'react'
import './styles.scss'

import { SvgComponent } from './models'

type Props = {
  icon: SvgComponent
  tooltip?: string
  onClick?: () => void
  id?: string
}

export function Icon({ icon, tooltip: alt, onClick, id }: Props) {
  const className = `icon ${onClick ? 'clickable' : ''}`
  return (
    <span
      onClick={onClick}
      title={alt}
      className={className}
      aria-hidden={onClick === undefined}
      id={id}
    >
      {icon}
    </span>
  )
}
