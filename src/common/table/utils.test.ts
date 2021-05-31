import { render, shallow } from 'enzyme'
import { IdMapped } from '../models'
import * as formatters from '../utils/formatting'
import { HtmlSanitizationMode, sanitizeHtmlString } from '../utils/sanitization'
import { DataType } from './enum'
import { DateColumn, NumericColumn, RelationalColumn, TableColumn } from './models'
import {
  ABSOLUTE_MININMUM_COLUMN_WIDTH,
  EMPTY_CELL_TEXT,
  generateGridTemplateColumnSizes,
  getCellProperties,
  getRelatedDataItem,
  renderCellContents,
} from './utils'

interface TestModel {
  a: string
}

interface RelatedTestModel {
  id: string
}

describe('Table - Utils', () => {
  describe('getRelatedDataItem()', () => {
    const relatedDataArray: RelatedTestModel[] = [{ id: '1' }, { id: '2' }]
    const relatedDataObj: IdMapped<RelatedTestModel> = {
      item1: { id: '1' },
      item2: { id: '2' },
    }
    const column = (
      relatedDataList: RelatedTestModel[] | IdMapped<RelatedTestModel>
    ): RelationalColumn<TestModel> => ({
      propertyPath: 'a',
      headerText: 'A',
      relatedDataList: relatedDataList,
      type: DataType.RELATION,
      render: (relatedData: RelatedTestModel) => relatedData.id,
    })
    const cachedRelatedDataItems: IdMapped<RelatedTestModel> = {}

    it('retrieves the related ARRAY data item based off the id and saves it to cachedRelatedDataItems', () => {
      const result = getRelatedDataItem(
        '1',
        column(relatedDataArray),
        cachedRelatedDataItems
      )
      expect(result).toBe(relatedDataArray[0])
      expect(cachedRelatedDataItems).toEqual({ '1': relatedDataArray[0] })
    })

    it('retrieves the related OBJECT-MAPPED data item based off the id and saves it to cachedRelatedDataItems', () => {
      const id = 'item2'
      const result = getRelatedDataItem(
        id,
        column(relatedDataObj),
        cachedRelatedDataItems
      )
      expect(result).toBe(relatedDataObj[id])
      expect(cachedRelatedDataItems[id]).toEqual(relatedDataObj[id])
    })

    it('retrieves the item from the cache if its ID is in it', () => {
      const newId = 'I exist in cache'
      const cachedItem: RelatedTestModel = { id: newId }
      cachedRelatedDataItems[newId] = cachedItem
      const result = getRelatedDataItem(
        newId,
        column(relatedDataArray),
        cachedRelatedDataItems
      )
      expect(result).toBe(cachedItem)
    })
  })

  describe('renderCellContents()', () => {
    const dataItem: TestModel = { a: 'asdf' }

    describe('CUSTOM columns', () => {
      it('returns the render() result', () => {
        const renderFunc = (data: TestModel) => `Hello ${data.a}`
        const result = renderCellContents(
          {
            headerText: 'A',
            type: DataType.CUSTOM,
            render: renderFunc,
          },
          dataItem,
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(renderFunc(dataItem))
      })
    })

    describe('RELATIONAL columns', () => {
      it('returns the render() result with the correct relatedDataItem passed in', () => {
        const renderFunc = (data: RelatedTestModel) => `Hello ${data.id}`
        const expectedRelatedDataItem: RelatedTestModel = { id: dataItem.a }
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.RELATION,
            relatedDataList: [{ id: 'some other ID' }, expectedRelatedDataItem],
            render: renderFunc,
          },
          dataItem,
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(renderFunc(expectedRelatedDataItem))
      })

      it('returns the EMPTY_CELL_TEXT if the related data item could not be found', () => {
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.RELATION,
            relatedDataList: [{ id: 'some other ID' }],
            render: (data: RelatedTestModel) => `Hello ${data.id}`,
          },
          dataItem,
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(EMPTY_CELL_TEXT)
      })
    })

    describe('DATE columns', () => {
      interface DateTestModel {
        timeValue: number
      }
      const column: DateColumn<DateTestModel> = {
        propertyPath: 'timeValue',
        headerText: 'A',
        type: DataType.DATE,
        showTime: true,
        showSeconds: false,
      }
      const data: DateTestModel = { timeValue: new Date().getTime() }

      it('calls formatDate() with the settings in the column definition', () => {
        const spy = jest.spyOn(formatters, 'formatDate')
        const result = renderCellContents(column, data, {}, undefined, undefined)
        expect(spy).toHaveBeenCalledWith(
          data.timeValue,
          column.showTime,
          column.showSeconds
        )
        expect(result).toEqual(
          formatters.formatDate(data.timeValue, !!column.showTime, !!column.showSeconds)
        )
      })

      it('if a formatter override is given, that is called instead', () => {
        const spy = jest.spyOn(formatters, 'formatDate')
        const override = jest.fn().mockReturnValue('hurray')
        const result = renderCellContents(column, data, {}, { date: override }, undefined)
        expect(spy).not.toHaveBeenCalled()
        expect(override).toHaveBeenCalledWith(
          data.timeValue,
          column.showTime,
          column.showSeconds
        )
        expect(result).toEqual('hurray')
      })
    })

    describe('RICH_TEXT columns', () => {
      it('returns a div with the contents as the HTML value sanitized on RICH mode', () => {
        const htmlValue = '<table>asdf</table><b>yes</b>'
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.RICH_TEXT,
          },
          { a: htmlValue },
          {},
          undefined,
          undefined
        )
        const x = shallow(result)
        expect(x.html()).toEqual(
          `<div>${sanitizeHtmlString(htmlValue, HtmlSanitizationMode.RICH)}</div>`
        )
      })
    })

    describe('COLOR columns', () => {
      it("renders a div with the background colour and title set to the data's value", () => {
        const colorValue = 'red'
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.COLOR,
          },
          { a: colorValue },
          {},
          undefined,
          undefined
        )
        const x = render(result)
        expect(x.attr('title')).toEqual(colorValue)
        expect(x.attr('style')).toEqual(`background-color:${colorValue}`)
      })
    })

    describe('MONEY columns', () => {
      interface MoneyTestModel {
        moneyValue: number
      }
      const data: MoneyTestModel = { moneyValue: 12345 }
      const column: NumericColumn<MoneyTestModel> = {
        propertyPath: 'moneyValue',
        headerText: 'A',
        type: DataType.MONEY,
      }

      it('returns the money value formatted and prefixed with a $ symbol', () => {
        const result = renderCellContents(column, data, {}, undefined, undefined)
        expect(result).toEqual(`$${formatters.formatMoney(data.moneyValue)}`)
      })

      it('uses the formatter override instead, if given', () => {
        const override = (moneyValue: number) => `Hello ${moneyValue}`
        const result = renderCellContents(
          column,
          data,
          {},
          { money: override },
          undefined
        )
        expect(result).toEqual(override(data.moneyValue))
      })

      it('if the value is undefined, the empty text is returned', () => {
        const result = renderCellContents(
          column,
          // @ts-expect-error
          { moneyValue: undefined },
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(EMPTY_CELL_TEXT)
      })
    })

    describe('PLAIN_TEXT columns', () => {
      it('returns the value, if exists', () => {
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.PLAIN_TEXT,
          },
          dataItem,
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(dataItem.a)
      })

      it('returns the empty text otherwise', () => {
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.PLAIN_TEXT,
          },
          { a: undefined },
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(EMPTY_CELL_TEXT)
      })
    })

    describe('NUMBER columns', () => {
      it('returns the value, if exists', () => {
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.NUMBER,
          },
          dataItem,
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(dataItem.a)
      })

      it('returns the empty text otherwise', () => {
        const result = renderCellContents(
          {
            propertyPath: 'a',
            headerText: 'A',
            type: DataType.NUMBER,
          },
          { a: undefined },
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(EMPTY_CELL_TEXT)
      })
    })

    describe('Empty cell text', () => {
      it('is the default EMPTY_CELL_TEXT constant if no overrides are given', () => {
        const result = renderCellContents(
          {
            propertyPath: 'b',
            headerText: 'Nonexistant',
            type: DataType.PLAIN_TEXT,
          },
          dataItem,
          {},
          undefined,
          undefined
        )
        expect(result).toEqual(EMPTY_CELL_TEXT)
      })

      it('is messageOverrides.emptyCellText, if given', () => {
        const override = 'asdf'
        const result = renderCellContents(
          {
            propertyPath: 'b',
            headerText: 'Nonexistant',
            type: DataType.PLAIN_TEXT,
          },
          dataItem,
          {},
          undefined,
          override
        )
        expect(result).toEqual(override)
      })

      it("is the column's specific override, if given", () => {
        const tableWideOverride = 'asdf'
        const columnSpecificOverride = 'dfhsdfg'
        const result = renderCellContents(
          {
            propertyPath: 'b',
            headerText: 'Nonexistant',
            type: DataType.PLAIN_TEXT,
            emptyCellText: columnSpecificOverride,
          },
          dataItem,
          {},
          undefined,
          tableWideOverride
        )
        expect(result).toEqual(columnSpecificOverride)
      })
    })
  })

  describe('getCellProperties()', () => {
    it('returns an object containing className = table-cell and an empty style obj', () => {
      const result = getCellProperties(0, 0, [])
      expect(result).toEqual({ className: 'table-cell', style: {} })
    })

    it("when the column is pinned, it returns the above, plus a 'pinned' classname and a style object with the 'left' property set to the relevant value in pinnedColumnWidths", () => {
      const columnIndex = 1
      const pinnedColumnWidths = [10, 20]
      const result = getCellProperties(1, 2, pinnedColumnWidths)
      expect(result).toEqual({
        className: 'table-cell pinned',
        style: { left: pinnedColumnWidths[columnIndex - 1] },
      })
    })
  })

  describe('generateGridTemplateColumnSizes()', () => {
    const DEFAULT_SIZE = 'minmax(min-content, 1fr)'

    it(`sets everything to ${DEFAULT_SIZE} by default`, () => {
      const result = generateGridTemplateColumnSizes(
        [
          {} as unknown as TableColumn<TestModel>,
          {} as unknown as TableColumn<TestModel>,
          {} as unknown as TableColumn<TestModel>,
        ],
        {}
      )
      expect(result).toEqual(`${DEFAULT_SIZE} ${DEFAULT_SIZE} ${DEFAULT_SIZE}`)
    })

    it('uses any given defaultWidth values', () => {
      const result = generateGridTemplateColumnSizes(
        [
          { defaultWidth: '100px' } as unknown as TableColumn<TestModel>,
          {} as unknown as TableColumn<TestModel>,
          { defaultWidth: '2fr' } as unknown as TableColumn<TestModel>,
        ],
        {}
      )
      expect(result).toEqual(`100px ${DEFAULT_SIZE} 2fr`)
    })

    it('if a column is resized, its resizeData is used over any default widths', () => {
      const result = generateGridTemplateColumnSizes(
        [
          {
            defaultWidth: '100px',
            isResizable: true,
          } as unknown as TableColumn<TestModel>,
          {
            defaultWidth: '80px',
            isResizable: true,
          } as unknown as TableColumn<TestModel>,
          { defaultWidth: '2fr' } as unknown as TableColumn<TestModel>,
        ],
        {
          0: {
            startingWidth: 100,
            delta: 50,
          },
        }
      )
      expect(result).toEqual(`150px 80px 2fr`)
    })

    it('if a resized column is under the abolute minimum width, that minimum is used instead', () => {
      const result = generateGridTemplateColumnSizes(
        [
          {
            defaultWidth: '100px',
            isResizable: true,
          } as unknown as TableColumn<TestModel>,
          {
            defaultWidth: '80px',
            isResizable: true,
          } as unknown as TableColumn<TestModel>,
          { defaultWidth: '2fr' } as unknown as TableColumn<TestModel>,
        ],
        {
          0: {
            startingWidth: 100,
            delta: -80,
          },
        }
      )
      expect(result).toEqual(`${ABSOLUTE_MININMUM_COLUMN_WIDTH}px 80px 2fr`)
    })
  })
})
