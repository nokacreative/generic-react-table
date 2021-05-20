import React, { useCallback, useEffect, useMemo, useState } from 'react'

import './styles.scss'

import { Icon, Icons } from '../../../icon'
import { TableColumn } from '../../models'
import { filter, generateFilter } from './utils'
import { debounce, objectIsEmpty } from '../../../utils/general'
import { FilterMap } from './models'
import { IdMapped } from '../../../models'

export function useColumnFiltering<T>(
  isEnabled: boolean,
  columns: TableColumn<T>[],
  fullDataSet: T[],
  debounceMilis: number,
  isServerSide: boolean,
  onFilter: ((currentFilters: FilterMap<T>) => void) | undefined,
  cachedRelatedDataItems: IdMapped<any>
) {
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filteredData, setFilteredData] = useState<T[]>(fullDataSet)
  const [currentFilters, setCurrentFilters] = useState<FilterMap<T>>({})
  const [showFilterBackdrop, setShowFilterBackdrop] = useState<boolean>(false)

  const debouncedFilter = useCallback(
    debounce(
      (filters: FilterMap<T>, fullDataSet: T[]) =>
        filter(filters, fullDataSet, setFilteredData, cachedRelatedDataItems),
      debounceMilis
    ),
    [cachedRelatedDataItems]
  )

  useEffect(() => {
    if (isServerSide && onFilter) {
      onFilter(currentFilters)
    }
  }, [currentFilters])

  useEffect(() => {
    if (!isServerSide) {
      debouncedFilter(currentFilters, fullDataSet)
    }
  }, [currentFilters, fullDataSet])

  const columnFilters: JSX.Element[] | null = useMemo(
    () =>
      isEnabled && showFilters
        ? columns.map((c, i) => (
            <div key={`table-column-${i}-filter`} className="table-column-filter">
              {generateFilter(
                c,
                i,
                currentFilters,
                setCurrentFilters,
                fullDataSet,
                setShowFilterBackdrop
              )}
            </div>
          ))
        : null,
    [isEnabled, showFilters, columns, currentFilters, fullDataSet]
  )

  const filtersExist = isEnabled && !objectIsEmpty(currentFilters)

  const filterJsx = useMemo(
    () =>
      isEnabled ? (
        <>
          <Icon
            icon={Icons.Filter}
            tooltip="Filter"
            onClick={() => setShowFilters(!showFilters)}
          />
          {filtersExist && (
            <Icon
              icon={Icons.FilterClear}
              tooltip="Clear All Filters"
              onClick={() => setCurrentFilters({})}
            />
          )}
        </>
      ) : null,
    [isEnabled, showFilters, filtersExist]
  )

  return {
    filterJsx: filterJsx,
    columnFilters,
    filteredData: filtersExist && !isServerSide ? filteredData : fullDataSet,
    filtersExist,
    showFilterBackdrop,
  }
}
