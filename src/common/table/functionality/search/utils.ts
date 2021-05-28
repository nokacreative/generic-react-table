import { IdMapped } from '../../../models'
import { formatDate } from '../../../utils/formatting'
import { getNestedValue } from '../../../utils/general'
import { HtmlSanitizationMode, sanitizeHtmlString } from '../../../utils/sanitization'
import { DataType } from '../../enum'
import { DateFormatter, TableColumn } from '../../models'
import { getRelatedDataItem } from '../../utils'

export function searchTable<T>(
  searchTerm: string,
  fullDataSet: T[],
  columns: TableColumn<T>[],
  setSearchedData: React.Dispatch<React.SetStateAction<T[]>>,
  cachedRelatedDataItems: IdMapped<any>,
  dateFormatterOverride: DateFormatter | undefined
) {
  if (searchTerm === '') {
    setSearchedData(fullDataSet)
    return
  }
  const cleanedSearchTerm = searchTerm.trim().toLowerCase()
  if (cleanedSearchTerm.length === 0) {
    setSearchedData(fullDataSet)
    return
  }
  const filteredData = fullDataSet.filter((d) => {
    return columns.some((c) => {
      if (c.searchMatcher) {
        if (c.type === DataType.RELATION) {
          const id = getNestedValue(d, c.propertyPath as string)
          return c.searchMatcher(
            d,
            cleanedSearchTerm,
            getRelatedDataItem(id, c, cachedRelatedDataItems)
          )
        }
        return c.searchMatcher(d, cleanedSearchTerm)
      } else if ('propertyPath' in c) {
        const data = getNestedValue(d, c.propertyPath as string)
        if (c.type === DataType.NUMBER || c.type === DataType.MONEY) {
          return (data as number).toString().includes(cleanedSearchTerm)
        } else if (c.type === DataType.DATE) {
          const formatter = dateFormatterOverride || formatDate
          const dateStr = formatter(data, !!c.showTime, !!c.showSeconds)
          return dateStr.toLowerCase().includes(cleanedSearchTerm)
        } else if (c.type === DataType.RICH_TEXT) {
          const plainText = sanitizeHtmlString(data, HtmlSanitizationMode.PLAIN)
          return plainText.toLowerCase().includes(cleanedSearchTerm)
        } else if ((data as string).toLowerCase().includes(cleanedSearchTerm)) {
          return true
        }
      }
      return false
    })
  })
  setSearchedData(filteredData)
}
