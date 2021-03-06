import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'

import { CustomFilterType, DataType, FilterType } from '../../enum'
import {
  FilterMessageOverrides,
  FilterPlaceholderMessageOverrides,
  NumericColumn,
  TableColumn,
  TextColumn,
} from '../../models'
import { FilterMap } from './models'
import { filter, generateFilter } from './utils'

describe('Table Functionality - Filter - Utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('filter()', () => {
    const setFilteredData = jest.fn()

    describe('PLAIN_TEXT columns', () => {
      it('PARTIAL_MATCH works and is case-insensitive', () => {
        const data = [{ a: 'asdf' }, { a: 'PASD' }, { a: 'b' }]
        filter(
          {
            0: {
              column: {
                type: DataType.PLAIN_TEXT,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.PARTIAL_MATCH,
              },
              value: 'a',
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })

      it('EXACT_MATCH works and is case-insensitive', () => {
        const data = [{ a: 'asdf' }, { a: 'ASDF' }, { a: 'b' }]
        filter(
          {
            0: {
              column: {
                type: DataType.PLAIN_TEXT,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.EXACT_MATCH,
              },
              value: 'asDf',
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })
    })

    describe('COLOR columns', () => {
      it('matching against a single value works', () => {
        const data = [{ a: 'green' }, { a: 'red' }, { a: 'blue' }]
        filter(
          {
            0: {
              column: {
                type: DataType.COLOR,
                propertyPath: 'a',
                headerText: 'A',
              },
              value: 'red',
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[1]])
      })

      it('matching against multiple values work', () => {
        const data = [{ a: 'green' }, { a: 'red' }, { a: 'blue' }]
        filter(
          {
            0: {
              column: {
                type: DataType.COLOR,
                propertyPath: 'a',
                headerText: 'A',
                filterIsMultiple: true,
              },
              value: ['red', 'blue'],
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[1], data[2]])
      })
    })

    describe('RICH_TEXT columns', () => {
      it('works (always uses partial-matching), is case-insensitive, and ignores all HTML', () => {
        const data = [{ a: '<b>a</b>sdf' }, { a: 'AS<u>DF<u>' }, { a: 'b' }]
        filter(
          {
            0: {
              column: {
                type: DataType.RICH_TEXT,
                propertyPath: 'a',
                headerText: 'A',
              },
              value: 'asDf',
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })
    })

    describe('NUMBER and MONEY columns', () => {
      it("matches ranged numbers with no 'max' value", () => {
        const num = 10
        const data = [{ a: num }, { a: 11 }, { a: 9 }]
        filter(
          {
            0: {
              column: {
                type: DataType.NUMBER,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.RANGED,
              },
              value: { min: num, max: null },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })

      it("matches ranged numbers with no 'min' value", () => {
        const num = 10
        const data = [{ a: num }, { a: 11 }, { a: 9 }]
        filter(
          {
            0: {
              column: {
                type: DataType.MONEY,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.RANGED,
              },
              value: { min: null, max: num },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[2]])
      })

      it("matches ranged numbers with both 'min' and 'max' values", () => {
        const data = [{ a: 10 }, { a: 11 }, { a: 9 }]
        filter(
          {
            0: {
              column: {
                type: DataType.MONEY,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.RANGED,
              },
              value: { min: 10, max: 12 },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })

      it('EXACT_MATCH works', () => {
        const num = 10
        const data = [{ a: num }, { a: 11 }, { a: 9 }]
        filter(
          {
            0: {
              column: {
                type: DataType.MONEY,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.EXACT_MATCH,
              },
              value: num,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0]])
      })

      it('MINIMUM works', () => {
        const num = 10
        const data = [{ a: num }, { a: 11 }, { a: 9 }]
        filter(
          {
            0: {
              column: {
                type: DataType.MONEY,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.MINIMUM,
              },
              value: num,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })

      it('MAXIMUM works', () => {
        const num = 10
        const data = [{ a: num }, { a: 11 }, { a: 9 }]
        filter(
          {
            0: {
              column: {
                type: DataType.NUMBER,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.MAXIMUM,
              },
              value: num,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[2]])
      })
    })

    describe('DATE columns', () => {
      it("matches ranged dates with no 'to' value", () => {
        const date = new Date(2021, 4, 27).getTime()
        const data = [{ a: date }, { a: new Date(2020, 4, 27).getTime() }]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.RANGED,
              },
              value: { from: date, to: null },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0]])
      })

      it("matches ranged dates with no 'from' value", () => {
        const date = new Date(2021, 4, 27).getTime()
        const data = [{ a: date }, { a: new Date(2020, 4, 27).getTime() }]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.RANGED,
              },
              value: { from: null, to: date },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith(data)
      })

      it("matches ranged dates with both 'to' and 'from'", () => {
        const dateMin = new Date(2020, 4, 27).getTime()
        const dateMax = new Date(2021, 4, 27).getTime()
        const data = [{ a: dateMax }, { a: dateMin - 100 }]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.RANGED,
              },
              value: { from: dateMin, to: dateMax },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0]])
      })

      it('matches MINIMUM dates', () => {
        const date = new Date(2021, 4, 27).getTime()
        const data = [{ a: date }, { a: date + 100 }, { a: date - 100 }]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.MINIMUM,
              },
              value: date,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })

      it('matches MAXIMUM dates', () => {
        const date = new Date(2021, 4, 27).getTime()
        const data = [{ a: date }, { a: date + 100 }, { a: date - 100 }]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.MAXIMUM,
              },
              value: date,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[2]])
      })

      it('matches EXACT_MATCH dates, without time', () => {
        const date = new Date(2021, 4, 27)
        const data = [
          { a: date.getTime() },
          { a: new Date(2021, 4, 28).getTime() },
          { a: new Date(2021, 4, 26).getTime() },
        ]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.EXACT_MATCH,
              },
              value: date,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0]])
      })

      it('matches EXACT_MATCH dates, with time (no seconds)', () => {
        const date = new Date(2021, 4, 27, 3, 58)
        const data = [
          { a: new Date(2021, 4, 27, 3, 58, 0) },
          { a: new Date(2021, 4, 27, 3, 58, 30).getTime() },
          { a: new Date(2021, 4, 27, 3, 57).getTime() },
        ]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.EXACT_MATCH,
                showTime: true,
              },
              value: date,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
      })

      it('matches EXACT_MATCH dates, with time and seconds', () => {
        const date = new Date(2021, 4, 27, 3, 58, 20)
        const data = [
          { a: new Date(2021, 4, 27, 3, 58, 20) },
          { a: new Date(2021, 4, 27, 3, 58, 30).getTime() },
          { a: new Date(2021, 4, 27, 3, 57).getTime() },
        ]
        filter(
          {
            0: {
              column: {
                type: DataType.DATE,
                propertyPath: 'a',
                headerText: 'A',
                filterType: FilterType.EXACT_MATCH,
                showTime: true,
                showSeconds: true,
              },
              value: date,
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0]])
      })
    })

    describe('CUSTOM and RELATION columns', () => {
      describe("uses the column's matcher with a cleaned filter value for TEXT, DROPDOWN, and non-ranged NUMERIC filter types", () => {
        function doTest(filterType: CustomFilterType) {
          const matcher = jest.fn((value: string, row: { a: string }) =>
            row.a.includes(value)
          )
          const data = [{ a: 'asdf' }, { a: 's' }, { a: 'df' }]
          filter(
            {
              0: {
                column: {
                  type: DataType.CUSTOM,
                  headerText: 'A',
                  filter: {
                    // @ts-expect-error
                    type: filterType,
                    matcher,
                  },
                  render: jest.fn(),
                },
                value: 'asDF  ',
              },
            },
            data,
            setFilteredData,
            {}
          )
          expect(setFilteredData).toHaveBeenCalledWith([data[0]])
          expect(matcher).toHaveBeenCalledWith('asdf', data[0], undefined)
        }

        it('TEXT', () => doTest(CustomFilterType.TEXT))
        it('TEXT', () => doTest(CustomFilterType.DROPDOWN))
        it('TEXT', () => doTest(CustomFilterType.NUMBER))
      })

      it("uses the column's matcher with a cleaned min and max filter value for ranged NUMERIC filter types", () => {
        const matcher = jest.fn(
          (min: number | '', max: number | '', row: { a: number }) =>
            row.a <= max && row.a >= min
        )
        const data = [{ a: 10 }, { a: 11 }, { a: 9 }]
        filter<{ a: number }>(
          {
            0: {
              column: {
                type: DataType.CUSTOM,
                headerText: 'A',
                filter: {
                  type: CustomFilterType.NUMBER,
                  matcher,
                  isRanged: true,
                },
                render: jest.fn(),
              },
              value: { min: 10, max: 20 },
            },
          },
          data,
          setFilteredData,
          {}
        )
        expect(setFilteredData).toHaveBeenCalledWith([data[0], data[1]])
        expect(matcher).toHaveBeenCalledWith(10, 20, data[0], undefined)
      })
    })
  })

  describe('generateFilter()', () => {
    const setCurrentFilters = jest.fn()
    const setShowFilterBackdrop = jest.fn()

    describe('PLAIN_TEXT columns', () => {
      function generateElement(
        extraColumnConfig: Partial<TextColumn<any>>,
        messageOverrides?: FilterMessageOverrides,
        currentFilters: FilterMap<any> = {}
      ) {
        const fullColumn: TextColumn<any> = {
          type: DataType.PLAIN_TEXT,
          propertyPath: 'a',
          headerText: 'A',
          ...extraColumnConfig,
        }
        const result = generateFilter(
          fullColumn,
          0,
          currentFilters,
          setCurrentFilters,
          [],
          setShowFilterBackdrop,
          messageOverrides
        )
        const element = render(result as JSX.Element).getByRole('textbox')
        return { element, column: fullColumn }
      }

      it("returns an input with the placeholder as 'Exact' when the filter type is EXACT_MATCH", () => {
        const { element } = generateElement({ filterType: FilterType.EXACT_MATCH })
        expect(element.getAttribute('placeholder')).toEqual('Exact')
      })

      it("returns an input with the placeholder as 'Contains' when the filter type is PARTIAL_MATCH", () => {
        const { element } = generateElement({ filterType: FilterType.PARTIAL_MATCH })
        expect(element.getAttribute('placeholder')).toEqual('Contains')
      })

      it('returns an input with the placeholder set to the given override when the filter type is PARTIAL_MATCH', () => {
        const placeholderOverride = 'asdf'
        const { element } = generateElement(
          { filterType: FilterType.PARTIAL_MATCH },
          { placeholders: { partialMatch: placeholderOverride } }
        )
        expect(element.getAttribute('placeholder')).toEqual(placeholderOverride)
      })

      it('returns an input with the placeholder set to the given override when the filter type is EXACT_MATCH', () => {
        const placeholderOverride = 'asdf'
        const { element } = generateElement(
          { filterType: FilterType.EXACT_MATCH },
          { placeholders: { exactMatch: placeholderOverride } }
        )
        expect(element.getAttribute('placeholder')).toEqual(placeholderOverride)
      })

      it('returns an input with the value set to an empty string when there is no corresponding current filter', () => {
        const { element } = generateElement(
          { filterType: FilterType.PARTIAL_MATCH },
          undefined,
          {}
        )
        expect(element.getAttribute('value')).toEqual('')
      })

      it("returns an input with the value set to the corresponding current filter's value when it exists", () => {
        const column: TableColumn<any> = {
          type: DataType.PLAIN_TEXT,
          propertyPath: 'a',
          headerText: 'A',
          filterType: FilterType.EXACT_MATCH,
        }
        const filterValue = 'asdfg'
        const { element } = generateElement(column, undefined, {
          0: {
            column,
            value: filterValue,
          },
        })
        expect(element.getAttribute('value')).toEqual(filterValue)
      })

      it("onChange, the input's value is added to the current filters", () => {
        const inputValue = 'a'
        const currentFilters: FilterMap<any> = {
          1: {
            column: {} as unknown as TableColumn<any>,
            value: 'asdf',
          },
        }
        const { element, column } = generateElement({}, undefined, currentFilters)
        userEvent.type(element, inputValue)
        expect(setCurrentFilters).toHaveBeenCalledWith({
          ...currentFilters,
          0: { column, value: inputValue },
        })
      })

      it("onChange, if the input's value is empty, it is removed from the current filters", () => {
        const currentFilters: FilterMap<any> = {
          1: {
            column: {} as unknown as TableColumn<any>,
            value: 'asdf',
          },
          0: {
            column: {} as unknown as TableColumn<any>,
            value: 'asdf',
          },
        }
        const { element } = generateElement({}, undefined, currentFilters)
        userEvent.clear(element)
        expect(setCurrentFilters).toHaveBeenCalledWith({ 1: currentFilters[1] })
      })
    })

    describe('NUMBER columns', () => {
      function generateElement(
        extraColumnConfig: Partial<NumericColumn<any>>,
        messageOverrides?: FilterMessageOverrides,
        currentFilters: FilterMap<any> = {}
      ) {
        const fullColumn: NumericColumn<any> = {
          type: DataType.NUMBER,
          propertyPath: 'a',
          headerText: 'A',
          ...extraColumnConfig,
        }
        const result = generateFilter(
          fullColumn,
          0,
          currentFilters,
          setCurrentFilters,
          [],
          setShowFilterBackdrop,
          messageOverrides
        )
        const element = render(result as JSX.Element)
        return {
          element:
            fullColumn.filterType === FilterType.RANGED
              ? element.getAllByRole('spinbutton')
              : element.getByRole('spinbutton'),
          column: fullColumn,
        }
      }

      function expectPlaceholder(
        filterType: Exclude<FilterType, FilterType.PARTIAL_MATCH>,
        expectedPlaceholder: string | { from: string; to: string },
        placeholderOverrides?: FilterPlaceholderMessageOverrides
      ) {
        const { element } = generateElement(
          { filterType },
          placeholderOverrides ? { placeholders: placeholderOverrides } : undefined
        )
        if (typeof expectedPlaceholder === 'string') {
          expect((element as HTMLElement).getAttribute('placeholder')).toEqual(
            expectedPlaceholder
          )
        } else {
          const elements = element as HTMLElement[]
          expect(elements[0].getAttribute('placeholder')).toEqual(
            expectedPlaceholder.from
          )
          expect(elements[1].getAttribute('placeholder')).toEqual(expectedPlaceholder.to)
        }
      }

      describe('returns a single numeric input with proper default placeholders', () => {
        it("'Exactly' when the filter type is EXACT_MATCH", () =>
          expectPlaceholder(FilterType.EXACT_MATCH, 'Exactly'))
        it("'At most'when the filter type is MAXIMUM", () =>
          expectPlaceholder(FilterType.MAXIMUM, 'At most'))
        it("'At least' when the filter type is MINIMUM", () =>
          expectPlaceholder(FilterType.MINIMUM, 'At least'))
      })

      describe('returns a single numeric input with the placeholder overrides', () => {
        it('EXACT_MATCH', () =>
          expectPlaceholder(FilterType.EXACT_MATCH, 'asdf', { numericExact: 'asdf' }))
        it('MINIMUM', () =>
          expectPlaceholder(FilterType.MINIMUM, 'asdf', { numericMin: 'asdf' }))
        it('MAXIMUM', () =>
          expectPlaceholder(FilterType.MAXIMUM, 'asdf', { numericMax: 'asdf' }))
      })

      it("sets the input's value to an empty string when there is no corresponding current filter", () => {
        const { element } = generateElement(
          { filterType: FilterType.EXACT_MATCH },
          undefined,
          {}
        )
        expect((element as HTMLElement).getAttribute('value')).toEqual('')
      })

      it("sets the input's value to the corresponding current filter's value when it exists", () => {
        const filterValue = 'asdf'
        const { element } = generateElement(
          { filterType: FilterType.EXACT_MATCH },
          undefined,
          {
            0: {
              column: {} as unknown as TableColumn<any>,
              value: filterValue,
            },
          }
        )
        expect((element as HTMLElement).getAttribute('value')).toEqual(filterValue)
      })

      it("onChange, it parses the input's value as a float, and adds it to the current filters list", () => {
        const inputValue = '1.5'
        const currentFilters: FilterMap<any> = {
          1: {
            column: {} as unknown as TableColumn<any>,
            value: 'asdf',
          },
        }
        const { element, column } = generateElement({}, undefined, currentFilters)
        userEvent.type(element as HTMLElement, inputValue)
        expect(setCurrentFilters).toHaveBeenCalledWith({
          ...currentFilters,
          0: { column, value: parseFloat(inputValue) },
        })
      })

      it('onChange, it removes the filter when the input is cleared', () => {
        const currentFilters: FilterMap<any> = {
          1: {
            column: {} as unknown as TableColumn<any>,
            value: 'asdf',
          },
          0: {
            column: {} as unknown as TableColumn<any>,
            value: 100,
          },
        }
        const { element } = generateElement({}, undefined, currentFilters)
        userEvent.clear(element as HTMLElement)
        expect(setCurrentFilters).toHaveBeenCalledWith({ 1: currentFilters[1] })
      })

      describe('Ranged numeric filters', () => {
        it('has the correct default placeholders (Min and Max)', () => {
          expectPlaceholder(FilterType.RANGED, { from: 'Min', to: 'Max' })
        })

        it('has the correct override placeholders', () => {
          const expectedPlaceholders = { from: 'asdf', to: 'hfgdh' }
          expectPlaceholder(FilterType.RANGED, expectedPlaceholders, {
            numericRangeFrom: expectedPlaceholders.from,
            numericRangeTo: expectedPlaceholders.to,
          })
        })

        it("onChange of the min input, it sets the filter's min value and leaves the max alone", () => {
          const inputValue = '5'
          const currentFilters: FilterMap<any> = {
            0: {
              column: {} as unknown as TableColumn<any>,
              value: { min: '', max: 80 },
            },
          }
          const { element } = generateElement(
            { filterType: FilterType.RANGED },
            undefined,
            currentFilters
          )
          userEvent.type((element as HTMLElement[])[0], inputValue)
          expect(setCurrentFilters).toHaveBeenCalledWith({
            0: {
              column: {},
              value: { min: parseFloat(inputValue), max: 80 },
            },
          })
        })

        it("onChange of the max input, it sets the filter's max value and leaves the min alone", () => {
          const inputValue = '100'
          const currentFilters: FilterMap<any> = {
            0: {
              column: {} as unknown as TableColumn<any>,
              value: { min: 5, max: 80 },
            },
          }
          const { element } = generateElement(
            { filterType: FilterType.RANGED },
            undefined,
            currentFilters
          )
          const maxInput = (element as HTMLElement[])[1]
          userEvent.clear(maxInput)
          userEvent.type(maxInput, inputValue)
          expect(setCurrentFilters).toHaveBeenCalledWith({
            0: {
              column: {},
              value: { min: 5, max: parseFloat(inputValue) },
            },
          })
        })

        it('onChange, if both min and max values are empty strings, the filter is removed', () => {
          const currentFilters: FilterMap<any> = {
            0: {
              column: {} as unknown as TableColumn<any>,
              value: { min: '', max: 80 },
            },
          }
          const { element } = generateElement(
            { filterType: FilterType.RANGED },
            undefined,
            currentFilters
          )
          const maxInput = (element as HTMLElement[])[1]
          userEvent.clear(maxInput)
          expect(setCurrentFilters).toHaveBeenCalledWith({})
        })
      })
    })
  })
})
