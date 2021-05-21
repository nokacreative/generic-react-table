import { DropdownOption } from '../dropdown'
import { IdMapped } from '../models'
import { CustomFilterType, DataType, FilterType, SortDirection } from './enum'

interface TableColumnBase<T> {
  headerText: string
  isSortable?: boolean
  sortAccessor?: (row: T) => any
  defaultSortDirection?: SortDirection
  isResizable?: boolean
  /** All GridLayout values are valid: px, fr, minmax(), etc. */
  defaultWidth?: string
  searchMatcher?: (row: T, searchTerm: string, relatedDataItem?: any) => boolean
}

interface TableColumnBaseWithPath<T> extends TableColumnBase<T> {
  propertyPath: keyof T | string
}

export interface TextColumn<T> extends TableColumnBaseWithPath<T> {
  type: DataType.PLAIN_TEXT
  filterType?: FilterType.EXACT_MATCH | FilterType.PARTIAL_MATCH
}

export interface RichTextColumn<T> extends TableColumnBaseWithPath<T> {
  type: DataType.RICH_TEXT
}

export interface ColorColumn<T> extends TableColumnBaseWithPath<T> {
  type: DataType.COLOR
  filterIsMultiple?: boolean
}

export interface DateColumn<T> extends TableColumnBaseWithPath<T> {
  type: DataType.DATE
  showTime?: boolean
  showSeconds?: boolean
  filterType?: Exclude<FilterType, FilterType.PARTIAL_MATCH>
}

interface CustomTextFilter<T> {
  type: CustomFilterType.TEXT
  matcher: (value: string, row: T, relatedDataItem?: any) => boolean
}

export type CustomNumberFilter<T> = {
  type: CustomFilterType.NUMBER
} & (
  | {
      isRanged?: false | never
      matcher: (value: number, row: T, relatedDataItem?: any) => boolean
    }
  | {
      isRanged: true
      matcher: (
        min: number | '',
        max: number | '',
        row: T,
        relatedDataItem?: any
      ) => boolean
    }
)

interface CustomDropdownFilter<T> {
  type: CustomFilterType.DROPDOWN
  options: DropdownOption[]
  matcher: (value: any, row: T, relatedDataItem?: any) => boolean
  isMultiple?: boolean
}

export type CustomFilter<T> = { placeholder?: string } & (
  | CustomTextFilter<T>
  | CustomNumberFilter<T>
  | CustomDropdownFilter<T>
)

export interface CustomColumn<T> extends TableColumnBase<T> {
  type: DataType.CUSTOM
  render: (data: T) => string | JSX.Element | null
  filter?: CustomFilter<T>
}

export interface RelationalColumn<T> extends TableColumnBaseWithPath<T> {
  type: DataType.RELATION
  relatedDataList: { id: string }[] | IdMapped<any>
  render: (relatedData: any) => string | JSX.Element
  filter?: CustomFilter<T>
}

export interface NumericColumn<T> extends TableColumnBaseWithPath<T> {
  type: DataType.NUMBER | DataType.MONEY
  filterType?: Exclude<FilterType, FilterType.PARTIAL_MATCH>
}

export type TableColumn<T> =
  | TextColumn<T>
  | RichTextColumn<T>
  | ColorColumn<T>
  | RelationalColumn<T>
  | CustomColumn<T>
  | NumericColumn<T>
  | DateColumn<T>

export interface SortingRule<T> {
  columnDefinition: TableColumn<T>
  direction: SortDirection
}

export interface ColumnResizeData {
  [activeResizerIndex: number]: {
    delta: number
    startingWidth: number
  }
}

export type ReorderableColumn<T> = TableColumn<T> & {
  reorderProps: any
}

export type DateFormatter = (
  timeValue: number,
  showTime: boolean,
  showSeconds: boolean
) => string
export type MoneyFormatter = (value: number) => string

export interface MessageOverrides {
  noData?: (pluralEntityName?: string) => string
  noFilterResults?: string
  noSearchResults?: string
  xResults?: (x: number, pluralEntityName?: string) => string
  showingXofYResults?: (x: number, y: number, pluralEntityName?: string) => string
  resultsFilteredFrom?: (from: number, pluralEntityName?: string) => string
  filters?: FilterMessageOverrides
  searchTogglerButton?: string
}

export interface FormatterOverrides {
  date?: DateFormatter
  money?: MoneyFormatter
}

export interface FilterPlaceholderMessageOverrides {
  genericFilter?: string
  exactMatch?: string
  partialMatch?: string
  dateRangeFrom?: string
  dateRangeTo?: string
  dateExact?: string
  dateMin?: string
  dateMax?: string
  numericExact?: string
  numericMin?: string
  numericMax?: string
  numericRangeFrom?: string
  numericRangeTo?: string
  dropdownSingle?: string
  dropdownMultiple?: string
}

export interface FilterMessageOverrides {
  moneySymbol?: string
  togglerButtonTooltip?: string
  clearButtonTooltip?: string
  placeholders?: FilterPlaceholderMessageOverrides
  dateFormat?: string
  timeFormat?: string
}
