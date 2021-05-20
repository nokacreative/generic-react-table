import React from 'react'
import { DropdownOption } from './models'

type Props = {
  option: DropdownOption
  selectOption: (option: DropdownOption) => void
  isSelected: boolean
  isHovered: boolean
}

export function Option({ option, selectOption, isSelected, isHovered }: Props) {
  return (
    <div
      className={`dropdown-option ${isSelected ? 'selected' : ''} ${
        isHovered ? 'hovered' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation()
        selectOption(option)
      }}
      role="listitem"
      aria-selected={isSelected}
    >
      {option.render ? option.render() : option.text}
    </div>
  )
}
