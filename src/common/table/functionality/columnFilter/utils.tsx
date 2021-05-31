import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { Dropdown, DropdownOption } from '../../../dropdown'
import { IdMapped } from '../../../models'
import { getNestedValue, objectIsEmpty, setNestedValue } from '../../../utils/general'
import { HtmlSanitizationMode, sanitizeHtmlString } from '../../../utils/sanitization'
import { CustomFilterType, DataType, FilterType } from '../../enum'
import {
  CustomFilter,
  CustomNumberFilter,
  DateColumn,
  FilterMessageOverrides,
  FilterPlaceholderMessageOverrides,
  NumericColumn,
  TableColumn,
} from '../../models'
import { getRelatedDataItem } from '../../utils'
import { Filter, FilterMap, RangedDateFilterValue } from './models'
import { RangedFilterWrapper } from './rangedFilterWrapper'

function verifyNumericData(
  type: Exclude<FilterType, FilterType.PARTIAL_MATCH> | undefined,
  cleanedFilterValue: any,
  dataValue: number
) {
  if (type === FilterType.RANGED) {
    const { min, max } = cleanedFilterValue
    return (min ? dataValue >= min : true) && (max ? dataValue <= max : true)
  }
  const numericFilterValue = parseFloat(cleanedFilterValue)
  if (type === FilterType.EXACT_MATCH) {
    return numericFilterValue === dataValue
  }
  if (type === FilterType.MINIMUM) {
    return dataValue >= numericFilterValue
  }
  if (type === FilterType.MAXIMUM) {
    return dataValue <= numericFilterValue
  }
}

function verifyDate<T>(
  cleanedFilterValue: Date | RangedDateFilterValue,
  dataValue: number,
  column: DateColumn<T>
) {
  const dataDate = new Date(dataValue)
  if (column.filterType === FilterType.RANGED) {
    const { from, to } = cleanedFilterValue as RangedDateFilterValue
    return (from ? dataDate >= from : true) && (to ? dataDate <= to : true)
  }
  const filterDate = cleanedFilterValue as Date
  if (column.filterType === FilterType.MINIMUM) {
    return dataDate >= filterDate
  }
  if (column.filterType === FilterType.MAXIMUM) {
    return dataDate <= filterDate
  }
  if (column.filterType === FilterType.EXACT_MATCH) {
    if (column.showTime) {
      if (column.showSeconds) {
        return (
          new Date(filterDate.setMilliseconds(0)).getTime() ===
          new Date(dataDate.setMilliseconds(0)).getTime()
        )
      }
      return (
        new Date(filterDate.setSeconds(0, 0)).getTime() ===
        new Date(dataDate.setSeconds(0, 0)).getTime()
      )
    }
    const filterDateWithoutTime = [
      filterDate.getDay(),
      filterDate.getMonth(),
      filterDate.getFullYear(),
    ]
    const dataDateWithoutTime = [
      dataDate.getDay(),
      dataDate.getMonth(),
      dataDate.getFullYear(),
    ]
    return filterDateWithoutTime.every((x, i) => x === dataDateWithoutTime[i])
  }
}

export function filter<T>(
  currentFilters: FilterMap<T>,
  data: T[],
  setFilteredData: React.Dispatch<React.SetStateAction<T[]>>,
  cachedRelatedDataItems: IdMapped<any>
) {
  if (objectIsEmpty(currentFilters)) {
    setFilteredData(data)
    return
  }
  const filteredData = Object.values(currentFilters).reduce(
    (result, f) => {
      const cleanedFilterValue =
        typeof f.value === 'string' ? f.value.trim().toLowerCase() : f.value
      return result.filter((d) => {
        const dataValue =
          'propertyPath' in f.column
            ? getNestedValue(d, f.column.propertyPath as string)
            : undefined
        switch (f.column.type) {
          case DataType.PLAIN_TEXT: {
            const cleanedDataValue = (dataValue as string).toLowerCase().trim()
            if (f.column.filterType === FilterType.EXACT_MATCH) {
              return cleanedDataValue === cleanedFilterValue
            } else {
              return cleanedDataValue.includes(cleanedFilterValue)
            }
          }
          case DataType.COLOR: {
            if (f.column.filterIsMultiple) {
              return (cleanedFilterValue as string[]).includes(dataValue)
            }
            return dataValue === cleanedFilterValue
          }
          case DataType.RICH_TEXT:
            return sanitizeHtmlString(dataValue, HtmlSanitizationMode.PLAIN)
              .toLowerCase()
              .includes(cleanedFilterValue)
          case DataType.NUMBER:
          case DataType.MONEY:
            return verifyNumericData(f.column.filterType, cleanedFilterValue, dataValue)
          case DataType.DATE: {
            return verifyDate(cleanedFilterValue, dataValue, f.column)
          }
          case DataType.RELATION:
          case DataType.CUSTOM: {
            const cf = f.column.filter as CustomFilter<T>
            const relatedDataItem =
              f.column.type === DataType.RELATION
                ? getRelatedDataItem(dataValue, f.column, cachedRelatedDataItems)
                : undefined
            if (
              cf.type === CustomFilterType.TEXT ||
              cf.type === CustomFilterType.DROPDOWN
            ) {
              return cf.matcher(cleanedFilterValue, d, relatedDataItem)
            }
            if (cf.type === CustomFilterType.NUMBER) {
              if (cf.isRanged) {
                const { min, max } = cleanedFilterValue
                return cf.matcher(min, max, d, relatedDataItem)
              } else {
                return cf.matcher(cleanedFilterValue, d, relatedDataItem)
              }
            }
            return false
          }
        }
      })
    },
    [...data]
  )
  setFilteredData(filteredData)
}

interface Meta<T> {
  column: TableColumn<T>
  columnIndex: number
  currentFilters: FilterMap<T>
  setCurrentFilters: React.Dispatch<React.SetStateAction<FilterMap<T>>>
  messageOverrides: FilterMessageOverrides | undefined
}

function addOrUpdateFilters<T>(
  filterValue: any,
  meta: Meta<T>,
  customValue?: {
    defaultValue: any
    path: string
    removalCheck: (filterValue: any) => boolean
  }
) {
  function removeCurrentFilter() {
    if (objectIsEmpty(meta.currentFilters)) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [meta.columnIndex]: _removedFilter, ...rest } = meta.currentFilters
    meta.setCurrentFilters(rest)
  }

  if (customValue) {
    const existingFilter: Filter<T> = meta.currentFilters[meta.columnIndex] || {
      column: meta.column,
      value: customValue.defaultValue,
    }
    const updatedFilter = setNestedValue(
      existingFilter,
      `value.${customValue.path}`,
      filterValue
    )
    if (customValue.removalCheck(updatedFilter.value)) {
      removeCurrentFilter()
      return
    }
    meta.setCurrentFilters({
      ...meta.currentFilters,
      [meta.columnIndex]: updatedFilter,
    })
    return
  }
  if (filterValue === '' || filterValue == null) {
    removeCurrentFilter()
  } else if (
    meta.column.type === DataType.DATE &&
    meta.column.filterType === FilterType.RANGED &&
    filterValue[0] === null &&
    filterValue[1] === null
  ) {
    removeCurrentFilter()
  } else {
    meta.setCurrentFilters({
      ...meta.currentFilters,
      [meta.columnIndex]: {
        column: meta.column,
        value: filterValue,
      },
    })
  }
}

function generateRangedFilter<T>(
  constantArgs: Meta<T>,
  extraClassName?: string,
  extraInputProps?: IdMapped<any>
) {
  const onChangeFunc =
    (extraValuePath: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = parseFloat(e.target.value)
      addOrUpdateFilters(Number.isNaN(numericValue) ? '' : numericValue, constantArgs, {
        defaultValue: { min: '', max: '' },
        path: extraValuePath,
        removalCheck: (filterValue: { min: number | string; max: number | string }) =>
          filterValue.min === '' && filterValue.max === '',
      })
    }
  const existingFilterValue = constantArgs.currentFilters[constantArgs.columnIndex]?.value
  const placeholderOverrides = constantArgs.messageOverrides?.placeholders
  return (
    <RangedFilterWrapper
      fromFilter={
        <input
          placeholder={placeholderOverrides?.numericRangeFrom || 'Min'}
          type="number"
          onChange={onChangeFunc('min')}
          className={extraClassName}
          value={existingFilterValue?.min || ''}
          {...(extraInputProps || {})}
        />
      }
      toFilter={
        <input
          placeholder={placeholderOverrides?.numericRangeTo || 'Max'}
          type="number"
          onChange={onChangeFunc('max')}
          className={extraClassName}
          value={existingFilterValue?.max || ''}
          {...(extraInputProps || {})}
        />
      }
    />
  )
}

type FilterTypeWithPlaceholderText = Exclude<
  FilterType,
  FilterType.PARTIAL_MATCH | FilterType.RANGED
>

const NUMERIC_PLACEHOLDER_TEXT_BY_TYPE = (
  placeholderOverrides: FilterPlaceholderMessageOverrides | undefined
): {
  [key in FilterTypeWithPlaceholderText]: string
} => ({
  [FilterType.EXACT_MATCH]: placeholderOverrides?.numericExact || 'Exactly',
  [FilterType.MAXIMUM]: placeholderOverrides?.numericMax || 'At most',
  [FilterType.MINIMUM]: placeholderOverrides?.numericMin || 'At least',
})

const DATE_PLACEHOLDER_TEXT_BY_TYPE = (
  placeholderOverrides: FilterPlaceholderMessageOverrides | undefined
): {
  [key in FilterTypeWithPlaceholderText]: string
} => ({
  [FilterType.EXACT_MATCH]: placeholderOverrides?.dateExact || 'Exactly',
  [FilterType.MAXIMUM]: placeholderOverrides?.dateMax || 'Until',
  [FilterType.MINIMUM]: placeholderOverrides?.dateMin || 'From',
})

function generateNumericFilter<T>(
  constantArgs: Meta<T>,
  extraClassName?: string,
  extraInputProps?: IdMapped<any>
) {
  const { column } = constantArgs
  const isNumericColumn =
    column.type === DataType.NUMBER || column.type === DataType.MONEY
  if (isNumericColumn) {
    const c = column as NumericColumn<T>
    if (c.filterType === FilterType.RANGED) {
      return generateRangedFilter(constantArgs, extraClassName)
    }
  } else if (column.type === DataType.CUSTOM || column.type == DataType.RELATION) {
    const cf = column.filter as CustomNumberFilter<T>
    if (cf.isRanged) {
      return generateRangedFilter(constantArgs, extraClassName)
    }
  }
  const placeholderOverrides = constantArgs.messageOverrides?.placeholders
  return (
    <div className={extraClassName}>
      <input
        placeholder={
          isNumericColumn
            ? NUMERIC_PLACEHOLDER_TEXT_BY_TYPE(placeholderOverrides)[
                (column as NumericColumn<T>).filterType as FilterTypeWithPlaceholderText
              ]
            : placeholderOverrides?.genericFilter || 'Filter'
        }
        type="number"
        onChange={(e) => {
          const numericValue = parseFloat(e.target.value)
          addOrUpdateFilters(Number.isNaN(numericValue) ? '' : numericValue, constantArgs)
        }}
        value={constantArgs.currentFilters[constantArgs.columnIndex]?.value || ''}
        {...(extraInputProps || {})}
      />
    </div>
  )
}

function generateDropdownFilter<T>(
  constantArgs: Meta<T>,
  setShowFilterBackdrop: React.Dispatch<React.SetStateAction<boolean>>,
  options: DropdownOption[],
  id: string,
  isMultiple?: boolean
) {
  const shouldPop = options.length >= 5
  const placeholderOverrides = constantArgs.messageOverrides?.placeholders
  return (
    <Dropdown
      options={options}
      onOptionSelected={
        isMultiple
          ? undefined
          : (option: DropdownOption | undefined) =>
              addOrUpdateFilters(option?.value || '', constantArgs)
      }
      onOptionsChanged={
        !isMultiple
          ? undefined
          : (options: DropdownOption[] | undefined) =>
              addOrUpdateFilters(options ? options.map((o) => o.value) : '', constantArgs)
      }
      id={`table-color-filter-dropdown-${id}`}
      placeholder={
        isMultiple
          ? placeholderOverrides?.dropdownMultiple || 'Multiple'
          : placeholderOverrides?.dropdownSingle || 'Filter'
      }
      saveSelection
      showClearButton
      isMultiple={isMultiple}
      extraClassName={shouldPop ? 'popped' : ''}
      onOpen={shouldPop ? () => setShowFilterBackdrop(true) : undefined}
      onClose={shouldPop ? () => setShowFilterBackdrop(false) : undefined}
      defaultValue={constantArgs.currentFilters[constantArgs.columnIndex]?.value}
      emptyOptionsText={constantArgs.messageOverrides?.emptyDropdown}
    />
  )
}

function generateDateFilter<T>(
  constantArgs: Meta<T>,
  existingFilter: Filter<T> | undefined,
  setShowFilterBackdrop: React.Dispatch<React.SetStateAction<boolean>>,
  isRanged: boolean,
  rangedPart?: 'from' | 'to'
) {
  const column = constantArgs.column as DateColumn<T>
  const defaultValue: Date | null | RangedDateFilterValue = isRanged
    ? { from: null, to: null }
    : null

  const messageOverrides = constantArgs.messageOverrides
  const placeholderOverrides = messageOverrides?.placeholders

  const placeholder = (() => {
    if (isRanged) {
      if (placeholderOverrides) {
        if (rangedPart === 'from' && placeholderOverrides.dateRangeFrom)
          return placeholderOverrides.dateRangeFrom
        else if (rangedPart === 'to' && placeholderOverrides.dateRangeTo)
          return placeholderOverrides.dateRangeTo
      }
      return `${rangedPart?.slice(0, 1).toUpperCase()}${rangedPart?.slice(1)}`
    } else if (column.filterType) {
      return DATE_PLACEHOLDER_TEXT_BY_TYPE(placeholderOverrides)[
        column.filterType as FilterTypeWithPlaceholderText
      ]
    }
    return placeholderOverrides?.genericFilter || 'Filter'
  })()

  const datePickerOverrides = messageOverrides?.datePicker
  const dateFormat = datePickerOverrides?.dateFormat || 'MM/dd/yyyy'
  const showTime = column.showTime
  const timeFormat = datePickerOverrides?.timeFormat
    ? datePickerOverrides.timeFormat(!!column.showSeconds)
    : column.showSeconds
    ? 'hh:mm:ss a'
    : 'hh:mm a'

  return (
    <DatePicker
      selected={(() => {
        const value = existingFilter ? existingFilter.value : defaultValue
        return isRanged ? value[rangedPart as string] : value
      })()}
      onChange={(date: Date) =>
        addOrUpdateFilters(
          date,
          constantArgs,
          isRanged
            ? {
                defaultValue,
                path: rangedPart as string,
                removalCheck: (filterValue: RangedDateFilterValue) =>
                  filterValue.from === null && filterValue.to === null,
              }
            : undefined
        )
      }
      showTimeSelect={showTime}
      showTimeInput={showTime}
      placeholderText={placeholder}
      dateFormat={showTime ? `${dateFormat} ${timeFormat}` : dateFormat}
      timeFormat={timeFormat}
      isClearable
      popperClassName="table-date-picker-popup"
      onCalendarOpen={() => setShowFilterBackdrop(true)}
      onCalendarClose={() => setShowFilterBackdrop(false)}
      locale={datePickerOverrides?.locale}
    />
  )
}

export function generateFilter<T>(
  column: TableColumn<T>,
  columnIndex: number,
  currentFilters: FilterMap<T>,
  setCurrentFilters: React.Dispatch<React.SetStateAction<FilterMap<T>>>,
  fullDataSet: T[],
  setShowFilterBackdrop: React.Dispatch<React.SetStateAction<boolean>>,
  messageOverrides: FilterMessageOverrides | undefined
) {
  const constantArgs: Meta<T> = {
    column,
    columnIndex,
    currentFilters,
    setCurrentFilters,
    messageOverrides,
  }
  if (column.type === DataType.PLAIN_TEXT || column.type === DataType.RICH_TEXT) {
    const placeholderOverrides = constantArgs.messageOverrides?.placeholders
    return (
      <input
        placeholder={
          column.type === DataType.PLAIN_TEXT &&
          column.filterType === FilterType.EXACT_MATCH
            ? placeholderOverrides?.exactMatch || 'Exact'
            : placeholderOverrides?.partialMatch || 'Contains'
        }
        onChange={(e) => addOrUpdateFilters(e.target.value, constantArgs)}
        value={currentFilters[columnIndex]?.value || ''}
      />
    )
  }
  if (column.type === DataType.NUMBER || column.type === DataType.MONEY) {
    const isMoneyType = column.type === DataType.MONEY
    return generateNumericFilter(
      constantArgs,
      isMoneyType ? 'money' : undefined,
      isMoneyType && messageOverrides?.moneySymbol
        ? { 'data-moneySymbol': messageOverrides.moneySymbol }
        : undefined
    )
  }
  if (column.type === DataType.DATE) {
    const isRanged = column.filterType === FilterType.RANGED
    const existingFilter: Filter<T> = currentFilters[columnIndex]
    if (!isRanged) {
      return generateDateFilter(
        constantArgs,
        existingFilter,
        setShowFilterBackdrop,
        false
      )
    } else {
      return (
        <RangedFilterWrapper
          fromFilter={generateDateFilter(
            constantArgs,
            existingFilter,
            setShowFilterBackdrop,
            true,
            'from'
          )}
          toFilter={generateDateFilter(
            constantArgs,
            existingFilter,
            setShowFilterBackdrop,
            true,
            'to'
          )}
          extraClassName="date-filter-wrapper"
        />
      )
    }
  }
  if (column.type === DataType.COLOR) {
    const uniqueColors = new Set<string>()
    fullDataSet.forEach((d) => {
      const color = getNestedValue(d, column.propertyPath as string)
      uniqueColors.add(color)
    })
    const options: DropdownOption[] = Array.from(uniqueColors).map((c) => ({
      text: c,
      render: () => (
        <>
          <span className="table-color-filter-preview" style={{ backgroundColor: c }} />
          {c}
        </>
      ),
      value: c,
    }))
    return generateDropdownFilter(
      constantArgs,
      setShowFilterBackdrop,
      options,
      column.propertyPath as string,
      column.filterIsMultiple
    )
  }
  if (column.type === DataType.CUSTOM || column.type === DataType.RELATION) {
    if (column.filter === undefined) {
      return
    }
    if (column.filter.type === CustomFilterType.TEXT) {
      return (
        <input
          placeholder={column.filter.placeholder}
          onChange={(e) => addOrUpdateFilters(e.target.value, constantArgs)}
          value={currentFilters[columnIndex]?.value || ''}
        />
      )
    }
    if (column.filter.type === CustomFilterType.NUMBER) {
      return generateNumericFilter(constantArgs)
    }
    if (column.filter.type === CustomFilterType.DROPDOWN) {
      return generateDropdownFilter(
        constantArgs,
        setShowFilterBackdrop,
        column.filter.options,
        Math.random().toString(),
        column.filter.isMultiple
      )
    }
  }
}
