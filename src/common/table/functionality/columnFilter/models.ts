import { TableColumn } from '../../models'

export interface Filter<T> {
  column: TableColumn<T>
  value: any
}

export type FilterMap<T> = { [columnIndex: number]: Filter<T> }

export interface RangedDateFilterValue {
  from: Date | null
  to: Date | null
}
