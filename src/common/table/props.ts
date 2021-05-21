import {
  FilterMessageOverrides,
  FormatterOverrides,
  MessageOverrides,
  SortingRule,
  TableColumn,
} from './models'
import { FilterMap } from './functionality/columnFilter'
import { DataType } from './enum'

type BaseProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  pluralEntityName?: string
  numPinnedColumns?: number
  canReorderColumns?: boolean
  minNumRows?: number
  showResultCount?: boolean
  showFilteredResultCount?: boolean
  onRowSelected?: (row: T, allSelections: T[], isDeselected: boolean) => void
  keepSelections?: boolean
  isLoading?: boolean
  loader?: React.ReactNode
  canSortMultipleColumns?: boolean
  tableName?: string
  searchDebounceMilis?: number
  /** Should only be used in tandem with a server */
  totalNumResults?: number
  id?: string
  className?: string
  messageOverrides?: MessageOverrides
  formatterOverrides?: FormatterOverrides
}

type PagingProps =
  | {
      usePaging?: never
    }
  | {
      usePaging: true
      defaultPageSize?: number
      pageSizeOptions?: number[]
    }

type ServerSidePagingProps =
  | { useServerSidePaging?: never }
  | {
      usePaging: true
      useServerSidePaging: true
      onPage: (pageIndex: number, pageSize: number) => void
      totalNumPages: number
    }

type ServerSideSortingProps<T> =
  | {
      useServerSideSorting?: never
    }
  | {
      useServerSideSorting: true
      onSort: (currentSortingRules: SortingRule<T>[]) => void
    }

type SearchingProps =
  | {
      isSearchable?: never
      useServerSideSearching?: never
    }
  | { isSearchable: true; useServerSideSearching?: never }
  | {
      isSearchable: true
      useServerSideSearching: true
      onSearch: (searchTerm: string) => void
    }

type FilteringProps<T> =
  | {
      isFilterable?: never
    }
  | {
      isFilterable: true
      useServerSideFiltering?: never
    }
  | {
      isFilterable: true
      useServerSideFiltering: true
      onFilter: (currentFilters: FilterMap<T>) => void
    }

export type Props<T> = BaseProps<T> &
  PagingProps &
  ServerSidePagingProps &
  ServerSideSortingProps<T> &
  SearchingProps &
  FilteringProps<T>

export function checkProps<T>(props: Props<T>) {
  if (
    props.totalNumResults === undefined &&
    (props.useServerSideSearching || (props.isFilterable && props.useServerSideFiltering))
  ) {
    throw new Error(
      'totalNumResults must be given when using server side searching, filtering, or paging.'
    )
  }

  props.columns.forEach((c, i) => {
    const problemColumnText = `Problem column: ${c.headerText}`

    if (c.isSortable && c.sortAccessor === undefined && !('propertyPath' in c)) {
      throw new Error(
        `A propertyPath or sortAccessor is required for sortable columns. ${problemColumnText}`
      )
    }

    if (
      props.isFilterable &&
      (c.type === DataType.NUMBER || c.type === DataType.MONEY) &&
      c.filterType === undefined
    ) {
      throw new Error(
        `A filter type must be defined for numeric colunnns when isFilterable is true. Ensure that the column definition contains a filterType property. ${problemColumnText}`
      )
    }

    if (props.numPinnedColumns !== undefined && i < props.numPinnedColumns) {
      if (c.defaultWidth === undefined) {
        throw new Error(
          `A default width, in px, must be defined for pinned columns. ${problemColumnText}`
        )
      } else if (/[0-9]+px/.test(c.defaultWidth) === false) {
        throw new Error(
          `The default width for pinned columns must be defined in pixels. ${problemColumnText}`
        )
      }
    }
  })
}
