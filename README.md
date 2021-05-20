A generic table written in React and Typescript with many features.

View the demo [here](https://nokacreative.github.io/noka-react-generic-table-demo/). The demo's repository can also be found [here](https://github.com/nokacreative/noka-generic-react-table-demo).

# Installation

```
npm i @noka/generic-react-table
```

or

```
yarn add @noka/generic-react-table
```

# Features

- Column sorting, resizing, reordering, and pinning
- Sorting
- Paging
- Searching
- Filtering
- Row selection (single and multiple)
- Integration with a server side
- Automatic handling (rendering, sort calculations, filter generation, etc.) of data types such as plain and rich text, numbers, dates, money, colours

# Usage

## Overview

1. Define your columns
2. Plug them and your data into `<Table>`

```
import { Table } from '@noka/generic-react-table'
import { data } from './database'

const columns: TableColumn<UserModel>[] => [
  {
    headerText: 'Column 1',
    type: DataType.PLAIN_TEXT,
  }
]

const App = () => (
  <Table columns={columns} data={data} />
)
```

## Code Samples

Gives an overview of the code used in the [demo](https://nokacreative.github.io/noka-react-generic-table-demo/). For the full code, see its [repository](https://github.com/nokacreative/noka-generic-react-table-demo).

All custom types that will be shown in these examples are described in-depth at the bottom of this document, in the "Comprehensive API reference" section.

### Basic table

![Basic Table](https://user-images.githubusercontent.com/6403562/118925195-5020b900-b90c-11eb-8be6-e6c09f98bad9.png)

Below are the definitions used for this particular sample. The `CUSTOM` and `RELATION` data types give you a `render()` function for you to decide how you want to render the cell, while all other data types automatically render their contents based on the given `propertyPath`.

```
import { Table, TableColumn, DataType } from '@noka/generic-react-table'
import { database } from './database'

interface UserModel {
  id: string
  userName: string
  displayName: string
  dateJoined: number
  groupId: string
}

const columns = (groups: GroupModel[]): TableColumn<UserModel>[] => [
  {
    headerText: 'User Name',
    type: DataType.CUSTOM,
    render: (user: UserModel) => (
      <Link to={ROUTES.userDetails(user.id)}>{user.userName}</Link>
    ),
  },
  {
    propertyPath: 'displayName',
    headerText: 'Display Name',
    type: DataType.PLAIN_TEXT,
  },
  {
    propertyPath: 'groupId',
    headerText: 'Group',
    type: DataType.RELATION,
    relatedDataList: groups,
    render: (relatedGroup: GroupModel) => (
      <Link to={ROUTES.groupDetails(relatedGroup.id)}>{relatedGroup.name}</Link>
    ),
  },
  {
    propertyPath: 'dateJoined',
    headerText: 'Date Joined',
    type: DataType.DATE,
    showTime: true,
    defaultWidth: 'max-content',
  },
]

const App = () => (
  <Table columns={columns(database.groups)} data={database.users} />
)
```

### Column sorting and resizing

![Sorting and resizing](https://user-images.githubusercontent.com/6403562/118935678-c972d880-b919-11eb-88c0-e40ac0af2ad5.png)

```
const columns: TableColumn<GroupModel>[] = [
  {
    headerText: 'Name',
    type: DataType.CUSTOM,
    render: (group: GroupModel) => (
      <Link to={ROUTES.groupDetails(group.id)}>{group.name}</Link>
    ),
    isSortable: true,
    sortAccessor: (group: GroupModel) => group.name,
    defaultSortDirection: SortDirection.ASCENDING,
    isResizable: true,
    defaultWidth: '200px',
  },
  {
    propertyPath: 'description',
    headerText: 'Rich Description',
    type: DataType.RICH_TEXT,
    isResizable: true,
  },
  {
    propertyPath: 'numUsers',
    headerText: '# Users',
    type: DataType.NUMBER,
    isSortable: true,
    defaultWidth: '0.5fr',
  },
]

const App = () => (
  <Table columns={columns(database.groups)} data={database.users} />
)
```

### Pinned columns and column reordering

![Pinned columns](https://user-images.githubusercontent.com/6403562/118935953-148ceb80-b91a-11eb-9b91-9d6705278dbd.png)

Pinning columns allow them to stay in place, even if everything else needs to scroll. There is no new code in the column definitions for this example--all you need are two properties in the Table component:

```
<Table
  columns={columns}
  data={database.tags}
  numPinnedColumns={1} <--
  canReorderColumns    <--
/>
```

### Minimum Number of Rows and Paging

![Paging](https://user-images.githubusercontent.com/6403562/118937307-65e9aa80-b91b-11eb-968f-e8f14ddd0d80.png)

Setting a minimum number of rows allows the table to stay a consistent length through different pages of possibly different data lengths. Ex. if min num rows are set to 5 when there are only 3 results:

![Min num rows](https://user-images.githubusercontent.com/6403562/118937800-ead4c400-b91b-11eb-9ca6-a5e109eb5f3a.png)

```
<Table
  columns={columns}
  data={database.products}
  minNumRows={5}
  usePaging
  defaultPageSize={5}
  pageSizeOptions={[1, 2, 5, 10]}
  showResultCount
/>
```

### Row selection

Single select and multiple-select are both supported.

![Row selection](https://user-images.githubusercontent.com/6403562/118938378-941bba00-b91c-11eb-98aa-2345ff07644b.png)

```
function onSingleSelection(user: UserModel) {
  alert(`You have selected the user with ID ${user.id}, name ${user.userName}`)
}

function onMultipleSelections(_: UserModel, allSelections: UserModel[]) {
  setButtonDisabled(allSelections.length === 0)
}

<Table
  columns={columns(groups)}
  data={users}
  onRowSelected={onSingleSelection}
/>

<Table
  columns={columns(groups)}
  data={users}
  onRowSelected={onMultipleSelections}
  keepSelections
/>
```

### Server-side Paging and Sorting

The necessary properties are `useServerSidePaging` and `onPage()`, and `useServerSideSorting` and `onSort()`. `totalNumPages` and `totalNumResults` must also be passed in when using server-side paging.

```
// Container
import { SortingRule } from '@noka/generic-react-table'

function doFetch() {
  fakeClient.fetchProducts(currParams.current).then((response: ServerResponse) => {
    setData(response.products) // <-- This data is passed into the view, which updates the table
    setTotalNumPages(response.totalNumPages)
    setTotalNumResults(response.totalNumResults)
    setLoading(false)
  })
}

function onSort(currentSortingRules: SortingRule<ProductModel>[]) {
  setLoading(true)
  currParams.current.sortingRules = currentSortingRules
  doFetch()
}

function onPage(pageIndex: number, pageSize: number) {
  setLoading(true)
  currParams.current.pageIndex = pageIndex
  currParams.current.pageSize = pageSize
  doFetch()
}

// View
<Table
  columns={columns}
  data={props.data}
  minNumRows={5}
  showResultCount

  // Paging
  usePaging
  useServerSidePaging
  onPage={props.onPage}
  totalNumPages={props.totalNumPages}
  totalNumResults={props.totalNumResults}
  // Optional
  defaultPageSize={DEFAULT_PAGE_SIZE}
  pageSizeOptions={[2, 3, 5]}

  // Sorting
  useServerSideSorting
  onSort={props.onSort}
  // Optional
  canSortMultipleColumns

  isLoading={props.isLoading}
/>
```

### Search and filter

![Search and filter](https://user-images.githubusercontent.com/6403562/118939848-207aac80-b91e-11eb-925a-b60780ae4749.png)

```
<Table
  columns={columns}
  data={database.people}
  isSearchable
  isFilterable
  tableName="People"
  showResultCount
/>

// Example columns
{
  propertyPath: 'age',
  headerText: 'Age',
  type: DataType.NUMBER,
  filterType: FilterType.EXACT_MATCH,
}

{
  propertyPath: 'dateOfBirth',
  headerText: 'Date of Birth',
  type: DataType.DATE,
  filterType: FilterType.RANGED,
}
```

### Server-side search and filter

Works the same way as server-side paging and sorting; with the properties `useServerSideSearching` and `onSearch()`, and `useServerSideFiltering` and `onFilter()`.

```
<Table
  columns={columns}
  data={props.data}

  // Search
  isSearchable
  useServerSideSearching
  onSearch={props.onSearch}

  // Filter
  isFilterable
  useServerSideFiltering
  onFilter={props.onFilter}

  // Necessary for either
  totalNumResults={props.totalNumResults}

  isLoading={props.isLoading}
  showResultCount
  tableName="People from Server"
/>
```

# Comprehensive API reference

## Common enums

### Data (Column) Types

Enum Name | Description
--- | ---
PLAIN_TEXT | Any non-formatted string.
RICH_TEXT | Any string with HTML formatting. Note that only simple tags (such as `i`, `b`, `br`, etc.) are allowed.
NUMBER | Any numeric value.
DATE | Any date. It expects a time value, eg. the result of `Date.getTime()`.
COLOR | Any valid CSS colour value, such as `blue`, `#0000FF`, etc.
MONEY | Any plain numeric value. It is automatically formatted when rendered.
RELATION | A value that is used in another dataset. Ex. Users in a system with groups may have a `groupId` property. When this data type is used for a column, the corresponding `Group` object is automatically retrieved, and can be rendered however you want.
CUSTOM | Anything that does not fall into the above categories.

There's also a self-explanatory `SortDirection` enum that is referenced below, with values of `ASCENDING` and `DESCENDING`.

### Filter Types
Enum Name | Description
--- | ---
EXACT_MATCH | Match exactly what the user types (but is case-insenstive).
PARTIAL_MATCH | Returns a match when data contains the search term.
RANGED | Has a minimum and maximum. For numeric types only (including `DATE` and `MONEY`).
MINIMUM | Returns a match when the value is at _least_ (and including) a certain threshold.
MAXIMUM | Returns a match when the value is at _most_ (and including) a certain threshold.

## Table component properties

### Base

Property | type | Required | Description
--- | --- | --- | ---
columns | TableColumn<T>[] | Y | The column definitions. 
data | T[] | Y | The data that the table is to render.
pluralEntityName | string | N | Ex. 'products', 'users', etc. Used in result messages, num selected messages, and when the table is empty (ex. "No items to display").
numPinnedColumns | number | N | The number of columns that should be pinned, if any.
canReorderColumns | boolean | N | Whether or not columns can be reordered.
minNumRows | number | N | The minimum number of rows the table must have.
showResultCount | boolean | N | Whether or not to show the number of results in the table.
isLoading | boolean | N | Shows a loader if true.
loader | React.ReactNode | N | Override the default loading text with a component.
canSortMultipleColumns | boolean | N | False by default.
tableName | string | N | The name of the table. Displayed in the header, if given.
searchDebounceMilis | number | The number of miliseconds to debounce searching and filtering inputs with. 200 by default.

All properties below are technically optional, but required if you want the specific functionality defined by each header.

### Paging

Property | type | Required | Description
--- | --- | --- | ---
usePaging | boolean | Y | Whether or not the table should be paged. False by default.
defaultPageSize | number | N | The number of results that should be in each page.
pageSizeOptions | number[] |  N | Generates a dropdown that allows the user to select their preferred page size. If not given, the dropdown will not appear.
useServerSidePaging | boolean | N | Whether or not to use server-side paging. False by default.
onPage | (pageIndex: number, pageSize: number) => void | Conditional | Necessary when `useServerSidePaging` is true.
totalNumPages | number | Conditional | Necessary when `useServerSidePaging` is true. Should be returned from the server.

### Row selection

Property | type | Required | Description
--- | --- | --- | ---
onRowSelected | (row: T, allSelections: T[], isDeselected: boolean) => void | Y | What to do when a row has been selected. `allSelections` will be empty if only single selections are supported.
keepSelections | boolean | N | Whether or not to keep selections, eg. allow multiple selections. False by default.

### Searching

Property | type | Required | Description
--- | --- | --- | ---
isSearchable | boolean | Y | Whether or not the table can be searched through. False by default.
useServerSideSearching | boolean | N | False by default.
onSearch | (currentFilters: FilterMap<T>) => void | Conditional | Necessary if `useServerSideFiltering` is true.

### Filtering

Property | type | Required | Description
--- | --- | --- | ---
isFilterable | boolean | Y | Whether or not the table can be filtered. False by default.
showFilteredResultCount | boolean | N | If true, the result count will say "Showing x of y results (filtered from z)". False by default.
useServerSideFiltering | boolean | N | False by default.
onFilter | (currentFilters: FilterMap<T>) => void | Conditional | Necessary if `useServerSideFiltering` is true.

### Server-only common properties
Property | type | Required | Description
--- | --- | --- | ---
totalNumResults | number | Y | The total number of results.

## Column property break down

### Common properties

Property | type | Required | Description
--- | --- | --- | ---
type | `DataType` | Y | The type of the column.
headerText | string | Y | The text that is displayed in the column's header.
defaultWidth | string | N | How wide you want the column to be. Can be in px, or take in any [Grid Layout value](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns).
isResizable | boolean | N | Whether or not the column can be resized.
isSortable | boolean | N | Whether or not the column can be sorted.
sortAccessor | (row: T) => any | N | All column types (aside from `CUSTOM` and `RELATION`) sort based on their dataType by default. You can override this behaviour by returning the data you would instead like to sort by.
defaultSortDirection | `SortDirection` | N | The direction to sort by, by default.
searchMatcher | (row: T, searchTerm: string) => boolean | N | Like with the sortAccessor, all non-custom and non-relation columns have their own code for determining whether or not its data includes the search term. You can override this behaviour (or define it for custom/relational columns) with this function.

### Plain text columns

Property | type | Required | Description
--- | --- | --- | ---
propertyPath | string | Y | Where the property lies in your model. Ex. if you have `UserModel { id: string }`, and you want an ID column, you would write `propertyPath: 'id'`.
filterType | `FilterType` (`PARTIAL_MATCH` or `EXACT_MATCH` only) | N | Only used if `isFilterable` is set to `true` in the Table component. Defaults to partial.

### Rich text columns

Property | type | Required | Description
--- | --- | --- | ---
propertyPath | string | Y | Where the property lies in your model. Ex. if you have `UserModel { bio: string }`, and you want an Bio column, you would write `propertyPath: 'bio'`.

### Number and Money columns

Property | type | Required | Description
--- | --- | --- | ---
propertyPath | string | Y | Where the property lies in your model.
filterType | `FilterType` (excluding `PARTIAL_MATCH`) | Conditional | Only used if `isFilterable` is set to `true` in the Table component. It does not default to anything, so it _must_ be specified in this case.

### Date columns

Property | type | Required | Description
--- | --- | --- | ---
propertyPath | string | Y | Where the property lies in your model.
showTime | boolean | N | Whether or not to show the time with the date.
showSeconds | boolean | N | Whether or not to include seconds with the time. False by default.
filterType | `FilterType` (excluding `PARTIAL_MATCH`) | Conditional | Only used if `isFilterable` is set to `true` in the Table component. It does not default to anything, so it _must_ be specified in this case.

### Colour columns

Property | type | Required | Description
--- | --- | --- | ---
propertyPath | string | Y | Where the property lies in your model.
filterIsMultiple | boolean | N | Only used if `isFilterable` is set to `true` in the Table component. Defaults to false. Determines whether or not multiple selections can be made in the filter.

### Relation columns

Property | type | Required | Description
--- | --- | --- | ---
propertyPath | string | Y | Where the property lies in your model.
relatedDataList | { id: string }[] &#124; { [key: string]: any } | Y | Where to get the related data from.
render | (relatedData: any) => string &#124; JSX.Element | Y | How to display the cell data.
filter | `CustomFilter` | Conditional | Must be defined if `isFilterable` is set to `true` in the Table component.

### Custom columns

Property | type | Required | Description
--- | --- | --- | ---
render | (data: T) => string &#124; JSX.Element &#124; null | Y | How to display the cell data.
filter | `CustomFilter` | Conditional | Must be defined if `isFilterable` is set to `true` in the Table component.

## Custom Filters

Used for custom and relation columns.

### Text

Property | type | Required | Description
--- | --- | --- | ---
type | `CustomFilterType.TEXT` | Y | Tells the compiler that you want to use this type of filter.
matcher | (value: string, row: T, relatedDataItem?: any) => boolean | Y | Determines whether or not the given value should return a match for the row. `relatedDataItem` is passed in when the column is a relational one.

### Number

Property | type | Required | Description
--- | --- | --- | ---
type | `CustomFilterType.NUMBER` | Y | Tells the compiler that you want to use this type of filter.
isRanged | boolean | N | Whether or not to use a ranged filter (eg. with min and max values).
matcher | (value: number, row: T, relatedDataItem?: any) => boolean | Conditional | Determines whether or not the given value should return a match for the row. `relatedDataItem` is passed in when the column is a relational one. Either this or the ranged version below must be defined.
matcher | ( min: number &#124; '', max: number &#124; '', row: T, relatedDataItem?: any ) => boolean } | Conditional | Same as above, but for ranged filters only. An empty value is passed in as `''`.

### Dropdown

Property | type | Required | Description
--- | --- | --- | ---
type | `CustomFilterType.DROPDOWN` | Y | Tells the compiler that you want to use this type of filter.
options | `DropdownOption[]` | Y | The options to pass into the dropdown. `DropwonOption` is defined as `{ text: string, value: any, render?: () => ReactNode }`.
matcher | (value: any, row: T, relatedDataItem?: any) => boolean | Determines whether or not the given value should return a match for the row. `relatedDataItem` is passed in when the column is a relational one.
isMultiple | boolean | N | Whether or not multiple selections can be made for this filter.