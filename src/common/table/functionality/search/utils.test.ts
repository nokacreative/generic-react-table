import { DataType } from '../../enum'
import { DateColumn } from '../../models'
import { searchTable } from './utils'

const setSearchedData = jest.fn()

interface TestModel {
  a: string
  b: {
    c: string
  }
  d: number
  date: number
  richText: string
}

interface RelatedTestModel {
  id: string
}

const data: TestModel[] = [
  {
    a: 'asdf',
    b: {
      c: '1',
    },
    d: 50,
    date: new Date(2021, 4, 27).getTime(),
    richText: '<b>hi</b> my name is',
  },
  {
    a: 'bp',
    b: {
      c: '0',
    },
    d: 20,
    date: new Date(2021, 3, 26).getTime(),
    richText: 'hi my <i>name</i> <u>is</u>',
  },
]

describe('Table Functionality - Search - Utils', () => {
  describe('searchTable()', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('sets the searched data to the full dataset when the search term is empty', () => {
      searchTable('', data, [], setSearchedData, {}, undefined)
      expect(setSearchedData).toHaveBeenCalledWith(data)
    })

    it('sets the searched data to the full dataset when the search term, after cleaning, is empty', () => {
      searchTable('  ', data, [], setSearchedData, {}, undefined)
      expect(setSearchedData).toHaveBeenCalledWith(data)
    })

    it('if a column has a searchMatcher, it is used to determine a match', () => {
      const searchMatcher = jest.fn((row: TestModel, searchTerm: string) =>
        row.a.includes(searchTerm)
      )
      const searchTerm = 'a   '
      const cleanedSearchTerm = 'a'
      searchTable<TestModel>(
        searchTerm,
        data,
        [
          {
            type: DataType.PLAIN_TEXT,
            propertyPath: 'a',
            headerText: 'A',
            searchMatcher,
          },
        ],
        setSearchedData,
        {},
        undefined
      )
      expect(setSearchedData).toHaveBeenCalledWith(
        data.filter((d) => searchMatcher(d, cleanedSearchTerm))
      )
      expect(searchMatcher).toHaveBeenCalledWith(data[0], cleanedSearchTerm)
    })

    it('if the column with the searchMatcher is relational, the related data item is passed into the matcher', () => {
      const searchMatcher = jest.fn(
        (row: TestModel, _searchTerm: string, relatedDataItem: RelatedTestModel) =>
          relatedDataItem.id === '1'
      )
      const searchTerm = 'a'
      const relatedDataList: RelatedTestModel[] = [{ id: '0' }, { id: '1' }]
      searchTable<TestModel>(
        searchTerm,
        data,
        [
          {
            type: DataType.RELATION,
            propertyPath: 'b.c',
            headerText: 'BC',
            searchMatcher,
            relatedDataList: relatedDataList,
            render: jest.fn(),
          },
        ],
        setSearchedData,
        {},
        undefined
      )
      expect(setSearchedData).toHaveBeenCalledWith([data[0]])
      expect(searchMatcher).toHaveBeenCalledWith(data[0], searchTerm, relatedDataList[1])
    })

    describe('numeric columns return a match when their stringified value contains the search term', () => {
      function doTest(type: DataType.NUMBER | DataType.MONEY) {
        searchTable<TestModel>(
          '5',
          data,
          [
            {
              type,
              propertyPath: 'd',
              headerText: 'D',
            },
          ],
          setSearchedData,
          {},
          undefined
        )
        expect(setSearchedData).toHaveBeenCalledWith([data[0]])
      }

      it('NUMBER columns', () => doTest(DataType.NUMBER))
      it('MONEY columns', () => doTest(DataType.MONEY))
    })

    describe('DATE columns match when the formatted date includes the search term', () => {
      const columns: DateColumn<TestModel>[] = [
        {
          type: DataType.DATE,
          propertyPath: 'date',
          headerText: 'Date',
        },
      ]

      it('using the default formatter (eg. no overrides)', () => {
        searchTable<TestModel>('05', data, columns, setSearchedData, {}, undefined)
        expect(setSearchedData).toHaveBeenCalledWith([data[0]])
      })

      it('using an override formatter', () => {
        const dateFormatter = jest.fn((timeValue: number) =>
          new Date(timeValue).toLocaleString([], { month: 'long' })
        )
        searchTable<TestModel>('Ma', data, columns, setSearchedData, {}, dateFormatter)
        data.forEach((d) =>
          expect(dateFormatter).toHaveBeenCalledWith(d.date, false, false)
        )
        expect(setSearchedData).toHaveBeenCalledWith([data[0]])
      })
    })

    it('RICH_TEXT columns match with all HTML removed', () => {
      searchTable<TestModel>(
        'hi my name is',
        data,
        [
          {
            type: DataType.RICH_TEXT,
            propertyPath: 'richText',
            headerText: 'RT',
          },
        ],
        setSearchedData,
        {},
        undefined
      )
      expect(setSearchedData).toHaveBeenCalledWith(data)
    })

    describe('all other column types use a lower-cased string value match', () => {
      function doTest(type: DataType.PLAIN_TEXT | DataType.COLOR) {
        searchTable<TestModel>(
          'a',
          data,
          [
            {
              type,
              propertyPath: 'a',
              headerText: 'A',
            },
          ],
          setSearchedData,
          {},
          undefined
        )
        expect(setSearchedData).toHaveBeenCalledWith([data[0]])
      }

      it('PLAIN_TEXT columns', () => doTest(DataType.PLAIN_TEXT))
      it('COLOR columns', () => doTest(DataType.COLOR))
    })
  })
})
