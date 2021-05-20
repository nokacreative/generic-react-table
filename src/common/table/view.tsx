import React, { useEffect, useMemo, useRef, useState } from 'react'
import './styles.scss'

import { ReorderableColumn } from './models'
import {
  generateGridTemplateColumnSizes,
  getCellProperties,
  renderCellContents,
} from './utils'
import { useSort } from './functionality/useSort.hook'
import { SortDirection } from './enum'
import { useColumnResize, ColumnResizer } from './functionality/columnResize'
import { useColumnReorder } from './functionality/useColumnReorder.hook'
import { usePaging } from './functionality/paging'
import { useSearch } from './functionality/search/useSearch.hook'
import { useColumnFiltering } from './functionality/columnFilter'
import { Props, checkProps } from './props'
import { IdMapped } from '../models'

const DEFAULT_DEBOUNCE_MILIS = 200

export function Table<T>(props: Props<T>) {
  useEffect(() => {
    checkProps(props)
  }, [props])

  const { sortedData, sortByColumn, currentSortingRules } = useSort(
    props.data,
    props.columns,
    !!props.canSortMultipleColumns,
    !!props.useServerSideSorting,
    props.useServerSideSorting && props.onSort
  )

  const { onMouseDown, onMouseMove, columnResizeData, activeResizerIndex } =
    useColumnResize()

  const numPinnedColumns = props.numPinnedColumns || 0
  const pinnedColumnWidths =
    numPinnedColumns > 0
      ? props.columns.slice(0, numPinnedColumns).map((c) => {
          if (c.defaultWidth) {
            return parseInt((c.defaultWidth as string).replace('px', ''))
          }
          return 0
        })
      : []

  const orderedColumns = useColumnReorder(
    !!props.canReorderColumns,
    props.columns,
    numPinnedColumns
  )

  const cachedRelatedDataItems = useRef<IdMapped<any>>({})

  const { searchedData, searchJsx, searchTermExists } = useSearch(
    !!props.isSearchable,
    sortedData,
    props.isSearchable ? !!props.useServerSideSearching : false,
    props.columns,
    props.searchDebounceMilis || DEFAULT_DEBOUNCE_MILIS,
    props.isSearchable && props.useServerSideSearching && props.onSearch,
    cachedRelatedDataItems.current
  )

  const { filterJsx, columnFilters, filteredData, filtersExist, showFilterBackdrop } =
    useColumnFiltering(
      !!props.isFilterable,
      orderedColumns,
      searchedData,
      props.searchDebounceMilis || DEFAULT_DEBOUNCE_MILIS,
      props.isFilterable ? !!props.useServerSideFiltering : false,
      props.isFilterable && props.useServerSideFiltering && props.onFilter,
      cachedRelatedDataItems.current
    )

  const { paginationJsx, dataInCurrentPage, pageSize } = usePaging(
    !!props.usePaging,
    filteredData,
    !!props.useServerSidePaging,
    props.usePaging && props.defaultPageSize,
    props.usePaging && props.pageSizeOptions,
    props.useServerSidePaging && props.onPage,
    props.useServerSidePaging && props.totalNumPages
  )

  const canSelectRows = props.onRowSelected !== undefined
  const [selectedRows, setSelectedRows] = useState<T[]>([])

  const resultsText = (() => {
    if (!props.showResultCount) {
      return undefined
    }
    const totalNumResults = props.totalNumResults || props.data.length
    let filteredNumResults = 0
    if (
      props.useServerSideSearching ||
      (props.isFilterable && props.useServerSideFiltering)
    ) {
      filteredNumResults = props.totalNumResults || 0
    } else if ((props.showFilteredResultCount && filtersExist) || searchTermExists) {
      filteredNumResults = filteredData.length
    } else {
      filteredNumResults = props.data.length
    }
    const baseText = `${filteredNumResults} ${props.pluralEntityName || 'results'}`
    return filteredNumResults !== totalNumResults
      ? `${baseText} (Filtered from ${props.totalNumResults || props.data.length})`
      : baseText
  })()

  const emptyRow = (message: string) => (
    <tr>
      <td
        className="table-message"
        style={{ gridColumn: `1 / ${orderedColumns.length + 1}` }}
      >
        {message}
      </td>
    </tr>
  )

  const mainElement = useMemo(() => {
    const columns = orderedColumns as ReorderableColumn<T>[]
    return (
      <table
        style={{
          gridTemplateColumns: generateGridTemplateColumnSizes(
            orderedColumns,
            columnResizeData
          ),
        }}
      >
        <thead>
          <tr className="table-row">
            {columns.map((c, i) => {
              const relevantSortingRule = c.isSortable
                ? currentSortingRules.find(
                    (r) => r.columnDefinition.headerText === c.headerText
                  )
                : undefined
              const { style, className } = getCellProperties(
                i,
                numPinnedColumns,
                pinnedColumnWidths
              )
              const wrapperClassNames = [className, 'table-header-cell-wrapper'].join(' ')
              const cellClassNames = ['table-header-cell']
              if (c.isSortable) cellClassNames.push('sortable')
              if (props.canReorderColumns && i >= numPinnedColumns)
                cellClassNames.push('reorderable')
              return (
                <th
                  className={wrapperClassNames}
                  style={style}
                  key={`table-header-cell-${i}`}
                >
                  <div
                    {...(props.canReorderColumns ? c.reorderProps : {})}
                    className={cellClassNames.join(' ')}
                  >
                    <div onClick={c.isSortable ? () => sortByColumn(c) : undefined}>
                      {c.headerText}
                      {relevantSortingRule && (
                        <span
                          className={`sort-indicator ${
                            relevantSortingRule.direction === SortDirection.ASCENDING
                              ? 'asc'
                              : 'desc'
                          }`}
                        />
                      )}
                      {!relevantSortingRule && c.isSortable && (
                        <span className="sort-indicator none" />
                      )}
                    </div>
                    {columnFilters && columnFilters[i]}
                  </div>
                  {c.isResizable && (
                    <ColumnResizer
                      onMouseDown={onMouseDown(i)}
                      isActive={activeResizerIndex === i}
                    />
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {dataInCurrentPage.length === 0 &&
            props.data.length > 0 &&
            emptyRow(
              filtersExist
                ? 'No results are available for the selected filters.'
                : 'No results are available for the given search term.'
            )}
          {!props.isLoading &&
            props.data.length === 0 &&
            emptyRow(`No ${props.pluralEntityName || 'items'} to display`)}
          {props.isLoading && props.data.length === 0 && emptyRow('')}
          {dataInCurrentPage.map((d, rowIndex) => {
            return (
              <tr
                className={`table-row ${
                  selectedRows.find((r) => r === d) ? 'selected' : ''
                }`}
                key={`table-row-${rowIndex}`}
                onClick={() => {
                  if (props.onRowSelected) {
                    if (props.keepSelections) {
                      const existingRowIndex = selectedRows.findIndex((r) => r === d)
                      if (existingRowIndex > -1) {
                        const newSelections = [
                          ...selectedRows.slice(0, existingRowIndex),
                          ...selectedRows.slice(existingRowIndex + 1),
                        ]
                        setSelectedRows(newSelections)
                        props.onRowSelected(d, newSelections, true)
                      } else {
                        const newSelections = [...selectedRows, d]
                        setSelectedRows(newSelections)
                        props.onRowSelected(d, newSelections, false)
                      }
                    } else {
                      props.onRowSelected(d, [], false)
                    }
                  }
                }}
              >
                {columns.map((c, columnIndex) => {
                  return (
                    <td
                      {...getCellProperties(
                        columnIndex,
                        numPinnedColumns,
                        pinnedColumnWidths
                      )}
                      key={`table-row-${rowIndex}-cell-${columnIndex}`}
                    >
                      {renderCellContents(c, d, cachedRelatedDataItems.current)}
                      {c.isResizable && (
                        <ColumnResizer
                          onMouseDown={onMouseDown(columnIndex)}
                          isActive={activeResizerIndex === columnIndex}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {props.minNumRows &&
            Array.from({
              length: Math.min(props.minNumRows, pageSize) - dataInCurrentPage.length,
            }).map((_, rowIndex: number) => (
              <tr key={`table-emptyRow-${rowIndex}`} className="table-row">
                {columns.map((_, columnIndex) => (
                  <td
                    className="table-cell"
                    key={`table-emptyRow-${rowIndex}-cell-${columnIndex}`}
                  />
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    )
  }, [
    dataInCurrentPage,
    orderedColumns,
    currentSortingRules,
    pageSize,
    columnFilters,
    activeResizerIndex,
    columnResizeData,
    numPinnedColumns,
    pinnedColumnWidths,
    cachedRelatedDataItems.current,
  ])

  const showTableActions = props.isSearchable || props.isFilterable

  return (
    <div id={props.id} className={`table-wrapper noka-table-colors ${props.className || ''}`}>
      {props.isLoading && (
        <div className="table-loader">{props.loader || 'Loading...'}</div>
      )}
      {(props.tableName || showTableActions) && (
        <section className="table-header">
          <div className="table-name">{props.tableName}</div>
          <div className="table-actions">
            {searchJsx}
            {filterJsx}
          </div>
        </section>
      )}
      <div
        className={`table-main ${canSelectRows ? 'selectable-rows' : ''}`}
        onMouseMove={onMouseMove}
      >
        {mainElement}
      </div>
      <section className="table-footer">
        {props.showResultCount && (
          <span className="table-result-count">
            {props.usePaging || showTableActions
              ? `Showing ${dataInCurrentPage.length} out of ${resultsText}`
              : resultsText}
          </span>
        )}
        {canSelectRows && props.keepSelections && (
          <span className="table-selected-rows-count">
            {selectedRows.length || 'No'} {props.pluralEntityName} selected
          </span>
        )}
        {paginationJsx}
      </section>
      {showFilterBackdrop && <div className="table-popup-filter-backdrop" />}
    </div>
  )
}
