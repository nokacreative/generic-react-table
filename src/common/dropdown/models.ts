import { ReactNode } from 'react'

export interface DropdownOption {
  text: string
  render?: () => ReactNode
  value: any
}
