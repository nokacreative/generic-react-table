import { useState, useEffect } from 'react'

import { getNestedValue } from '../../utils/general'
import { DataType, SortDirection } from '../enum'
import { SortingRule, TableColumn } from '../models'

function sortClientSide<T>(rules: SortingRule<T>[], unsortedData: T[]) {
  const sortedData = unsortedData.slice()
  rules.forEach((rule) => {
    sortedData.sort((a: T, b: T) => {
      const aData = rule.columnDefinition.sortAccessor
        ? rule.columnDefinition.sortAccessor(a)
        : getNestedValue(a, (rule.columnDefinition as any).propertyPath)
      const bData = rule.columnDefinition.sortAccessor
        ? rule.columnDefinition.sortAccessor(b)
        : getNestedValue(b, (rule.columnDefinition as any).propertyPath)
      if (
        rule.columnDefinition.type === DataType.PLAIN_TEXT &&
        typeof aData === 'string' &&
        typeof bData === 'string'
      ) {
        return aData.localeCompare(bData)
      }
      return aData - bData
    })
    if (rule.direction === SortDirection.DESCENDING) {
      sortedData.reverse()
    }
  })
  return sortedData
}

function getDefaultSortingRules<T>(columns: TableColumn<T>[]): SortingRule<T>[] {
  return columns
    .filter(
      (c) =>
        c.isSortable &&
        c.defaultSortDirection !== undefined &&
        c.defaultSortDirection !== SortDirection.NONE
    )
    .map((c) => ({
      columnDefinition: c,
      direction: c.defaultSortDirection as SortDirection,
    }))
}

export function useSort<T>(
  data: T[],
  columns: TableColumn<T>[],
  isMultiple: boolean,
  isServerSide: boolean,
  onSort: ((currentSortingRules: SortingRule<T>[]) => void) | undefined
) {
  const [sortedData, setSortedData] = useState<T[]>(data)
  const [currentSortingRules, setCurrentSortingRules] = useState<SortingRule<T>[]>(
    getDefaultSortingRules(columns)
  )

  function sortByColumn(columnDefinition: TableColumn<T>) {
    const existingRuleIndex = currentSortingRules.findIndex(
      (r) => r.columnDefinition.headerText === columnDefinition.headerText
    )
    const currentSortDirection =
      existingRuleIndex > -1
        ? currentSortingRules[existingRuleIndex].direction
        : SortDirection.NONE
    const newSortDirection = (() => {
      if (currentSortDirection === SortDirection.NONE) {
        return SortDirection.ASCENDING
      } else if (currentSortDirection === SortDirection.ASCENDING) {
        return SortDirection.DESCENDING
      }
      return SortDirection.NONE
    })()
    if (newSortDirection === SortDirection.NONE) {
      if (isMultiple) {
        setCurrentSortingRules([
          ...currentSortingRules.slice(0, existingRuleIndex),
          ...currentSortingRules.slice(existingRuleIndex + 1),
        ])
      } else {
        setCurrentSortingRules([])
      }
    } else {
      if (isMultiple) {
        if (existingRuleIndex > -1) {
          setCurrentSortingRules([
            ...currentSortingRules.slice(0, existingRuleIndex),
            {
              ...currentSortingRules[existingRuleIndex],
              direction: newSortDirection,
            },
            ...currentSortingRules.slice(existingRuleIndex + 1),
          ])
        } else {
          setCurrentSortingRules([
            ...currentSortingRules,
            {
              columnDefinition,
              direction: newSortDirection,
            },
          ])
        }
      } else {
        setCurrentSortingRules([
          {
            columnDefinition,
            direction: newSortDirection,
          },
        ])
      }
    }
  }

  useEffect(() => {
    if (!isServerSide) {
      if (currentSortingRules.length > 0) {
        setSortedData(sortClientSide(currentSortingRules, data))
      } else {
        setSortedData(data)
      }
    }
  }, [currentSortingRules, data])

  useEffect(() => {
    if (isServerSide && onSort) {
      onSort(currentSortingRules)
    }
  }, [currentSortingRules])

  return {
    sortedData: isServerSide ? data : sortedData,
    sortByColumn,
    currentSortingRules,
  }
}
