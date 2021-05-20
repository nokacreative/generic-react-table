import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownOption } from '../../../dropdown'
import { PageNavButton } from './pageNavButton'

const ELLIPSIS_JSX = <span className="ellipsis">...</span>
const ELLIPSIS_THRESHOLD = 4

export function usePaging<T>(
  isEnabled: boolean,
  fullDataSet: T[],
  isServerSide: boolean,
  defaultPageSize?: number,
  pageSizeOptions?: number[],
  onPage?: (pageIndex: number, pageSize: number) => void,
  totalNumPagesFromServer?: number
) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(defaultPageSize || 10)
  const [totalNumPages, setTotalNumPages] = useState<number>(totalNumPagesFromServer || 0)

  useEffect(() => {
    if (!isServerSide) {
      setCurrentPageIndex(0)
      setTotalNumPages(Math.ceil(fullDataSet.length / pageSize))
    }
  }, [pageSize, fullDataSet])

  useEffect(() => {
    if (isServerSide && onPage) {
      setCurrentPageIndex(0)
      onPage(0, pageSize)
    }
  }, [pageSize])

  useEffect(() => {
    if (isServerSide && onPage) {
      onPage(currentPageIndex, pageSize)
    }
  }, [currentPageIndex])

  useEffect(() => {
    if (totalNumPagesFromServer) {
      setTotalNumPages(totalNumPagesFromServer)
    }
  }, [totalNumPagesFromServer])

  const commonNavButtonProps = {
    currentPageIndex,
    setCurrentPageIndex,
  }

  const paginationJsx = isEnabled ? (
    <section className="table-pagination">
      {pageSizeOptions && (
        <label>
          Show
          <Dropdown
            id={`table-pagination-pagesize-dropdown-${Math.random()}`}
            options={pageSizeOptions.map((o) => ({ text: o.toString(), value: o }))}
            onOptionSelected={(option: DropdownOption | undefined) =>
              setPageSize(option?.value)
            }
            defaultValue={pageSize}
          />
        </label>
      )}
      <div className="table-paging-buttons-container">
        <PageNavButton
          label="&#x276E;"
          isDiabled={currentPageIndex === 0}
          gotoIndex={currentPageIndex - 1}
          {...commonNavButtonProps}
        />
        <PageNavButton gotoIndex={0} {...commonNavButtonProps} />
        {totalNumPages <= ELLIPSIS_THRESHOLD ? (
          <>
            {Array.from({ length: totalNumPages - 2 }).map((_, i) => (
              <PageNavButton
                key={`generated-page-nav-button-${i}`}
                gotoIndex={i + 1}
                {...commonNavButtonProps}
              />
            ))}
          </>
        ) : currentPageIndex <= 1 || currentPageIndex >= totalNumPages - 2 ? (
          <>
            <PageNavButton gotoIndex={1} {...commonNavButtonProps} />
            {ELLIPSIS_JSX}
            <PageNavButton gotoIndex={totalNumPages - 2} {...commonNavButtonProps} />
          </>
        ) : (
          <>
            {ELLIPSIS_JSX}
            {currentPageIndex > 2 && (
              <PageNavButton gotoIndex={currentPageIndex - 1} {...commonNavButtonProps} />
            )}
            <PageNavButton gotoIndex={currentPageIndex} {...commonNavButtonProps} />
            {currentPageIndex < totalNumPages && (
              <PageNavButton gotoIndex={currentPageIndex + 1} {...commonNavButtonProps} />
            )}
            {ELLIPSIS_JSX}
          </>
        )}
        {totalNumPages > 1 && (
          <PageNavButton gotoIndex={totalNumPages - 1} {...commonNavButtonProps} />
        )}
        <PageNavButton
          label="&#x276F;"
          isDiabled={currentPageIndex + 1 >= totalNumPages}
          gotoIndex={currentPageIndex + 1}
          {...commonNavButtonProps}
        />
      </div>
      <label>
        Jump to
        <Dropdown
          id={`table-pagination-jump-dropdown-${Math.random()}`}
          options={Array.from({ length: totalNumPages }).map((_, i) => ({
            text: (i + 1).toString(),
            value: i,
          }))}
          onOptionSelected={(option: DropdownOption | undefined) =>
            setCurrentPageIndex(option?.value)
          }
          placeholder="Page"
        />
      </label>
    </section>
  ) : null

  return {
    paginationJsx,
    dataInCurrentPage:
      isEnabled && !isServerSide
        ? fullDataSet.slice(
            currentPageIndex * pageSize,
            (currentPageIndex + 1) * pageSize
          )
        : fullDataSet,
    pageSize,
  }
}
