import React from 'react'

import { IdMapped } from '../models'
import { formatDate, formatMoney } from '../utils/formatting'
import { getNestedValue } from '../utils/general'
import { HtmlSanitizationMode, sanitizeHtmlString } from '../utils/sanitization'
import { DataType } from './enum'
import {
  ColumnResizeData,
  FormatterOverrides,
  RelationalColumn,
  TableColumn,
} from './models'

const EMPTY_CELL_TEXT = '-'

export function getRelatedDataItem<T>(
  id: string,
  columnDefinition: RelationalColumn<T>,
  cachedRelatedDataItems: IdMapped<any>
) {
  if (cachedRelatedDataItems[id]) {
    return cachedRelatedDataItems[id]
  }
  const item = Array.isArray(columnDefinition.relatedDataList)
    ? columnDefinition.relatedDataList.find((d) => d.id === id)
    : columnDefinition.relatedDataList[id]
  cachedRelatedDataItems[id] = item
  return item
}

export function renderCellContents<T>(
  columnDefinition: TableColumn<T>,
  dataItem: T,
  cachedRelatedDataItems: IdMapped<any>,
  formatterOverrides: FormatterOverrides | undefined
) {
  const isNumericType =
    columnDefinition.type === DataType.NUMBER || columnDefinition.type === DataType.MONEY
  const properEmptyText = isNumericType ? 0 : EMPTY_CELL_TEXT

  // Custom - columns do not use a propertyPath
  // Same with numeric columns, using render
  if (
    columnDefinition.type === DataType.CUSTOM ||
    (isNumericType && 'render' in columnDefinition)
  ) {
    return columnDefinition.render(dataItem) || properEmptyText
  }

  // Everything else does though
  // @ts-expect-error
  const value = getNestedValue(dataItem, columnDefinition.propertyPath)

  // Relation
  if (columnDefinition.type === DataType.RELATION) {
    const id = value as unknown as string
    const relatedDataItem = getRelatedDataItem(
      id,
      columnDefinition,
      cachedRelatedDataItems
    )
    if (relatedDataItem) {
      return columnDefinition.render(relatedDataItem)
    }
  }

  // Date
  else if (columnDefinition.type === DataType.DATE) {
    const formatter = formatterOverrides?.date || formatDate
    return formatter(value, !!columnDefinition.showTime, !!columnDefinition.showSeconds)
  }

  // Rich text
  else if (value && columnDefinition.type === DataType.RICH_TEXT) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeHtmlString(
            value as unknown as string,
            HtmlSanitizationMode.RICH
          ),
        }}
      />
    )
  }

  // Colour
  else if (value && columnDefinition.type === DataType.COLOR) {
    return (
      <div
        className="color-box"
        style={{ backgroundColor: value as any }}
        title={value}
      />
    )
  }

  // Money
  else if (columnDefinition.type === DataType.MONEY) {
    if (value) {
      if (formatterOverrides?.money) {
        return formatterOverrides.money(value)
      }
      return `$${formatMoney(value)}`
    }
    return EMPTY_CELL_TEXT
  }

  return value || properEmptyText
}

export const ABSOLUTE_MININMUM_COLUMN_WIDTH = 50

export function getCellProperties(
  columnIndex: number,
  numPinnedColumns: number,
  pinnedColumnWidths: number[]
) {
  const style: { [key: string]: any } = {}
  const classNames = ['table-cell']
  if (columnIndex < numPinnedColumns) {
    classNames.push('pinned')
    style.left = columnIndex > 0 ? pinnedColumnWidths[columnIndex - 1] : 0
  }
  return {
    style,
    className: classNames.join(' '),
  }
}

export function generateGridTemplateColumnSizes<T>(
  columns: TableColumn<T>[],
  columnResizeData: ColumnResizeData
) {
  return columns
    .map((c, i) => {
      const resizeData = columnResizeData[i]
      if (c.isResizable && resizeData) {
        return `${Math.max(
          resizeData.startingWidth + resizeData.delta,
          ABSOLUTE_MININMUM_COLUMN_WIDTH
        )}px`
      }
      return c.defaultWidth || 'minmax(min-content, 1fr)'
    })
    .join(' ')
}
