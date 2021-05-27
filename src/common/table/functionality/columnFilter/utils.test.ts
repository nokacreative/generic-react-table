import { CustomFilterType, DataType, FilterType } from '../../enum'
import { filter } from './utils'

const setFilteredData = jest.fn()

describe('Table Functionality - Filter - Utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('filter()', () => {
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
})
