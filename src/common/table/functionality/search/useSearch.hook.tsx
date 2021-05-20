import React, { useState, useEffect, useRef, useCallback } from 'react'
import './styles.scss'

import { Icon, Icons } from '../../../icon'
import { TableColumn } from '../../models'
import { searchTable } from './utils'
import { debounce } from '../../../utils/general'
import { IdMapped } from '../../../models'

export function useSearch<T>(
  isEnabled: boolean,
  fullDataSet: T[],
  isServerSide: boolean,
  columns: TableColumn<T>[],
  debounceMilis: number,
  onSearch: ((searchTerm: string) => void) | undefined,
  cachedRelatedDataItems: IdMapped<any>
) {
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false)
  const [searchedData, setSearchedData] = useState<T[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const searchInput = useRef<HTMLInputElement | null>()

  const performDebouncedSearch = useCallback(
    debounce((term: string, data: T[]) => {
      if (isServerSide && onSearch) {
        onSearch(term)
      } else {
        searchTable(term, data, columns, setSearchedData, cachedRelatedDataItems)
      }
    }, debounceMilis),
    [columns, debounceMilis, cachedRelatedDataItems]
  )

  useEffect(() => {
    performDebouncedSearch(searchTerm, fullDataSet)
  }, [searchTerm])

  useEffect(() => {
    if (!isServerSide) {
      performDebouncedSearch(searchTerm, fullDataSet)
    }
  }, [fullDataSet])

  function toggleSearchInput() {
    setShowSearchBar(!showSearchBar)
    if (!showSearchBar && searchInput.current) {
      searchInput.current.focus()
    }
  }

  const jsx = isEnabled ? (
    <div className={`table-action-search ${showSearchBar ? 'active' : ''}`}>
      <Icon icon={Icons.Search} tooltip="Search" onClick={toggleSearchInput} />
      <input
        className="table-search-input"
        spellCheck={false}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
        value={searchTerm}
        ref={(e) => (searchInput.current = e)}
      />
      {searchTerm !== '' && (
        <span className="table-search-clear" onClick={() => setSearchTerm('')}>
          &times;
        </span>
      )}
    </div>
  ) : null

  return {
    searchedData: isEnabled && !isServerSide ? searchedData : fullDataSet,
    searchJsx: jsx,
    searchTermExists: searchTerm !== '',
  }
}
