A generic table written in React and Typescript with many features.

View the demo [here](https://nokacreative.github.io/noka-react-generic-table-demo/).

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

## Column types and properties

### Data (Column) Types

Enum Name | Description
--- | ---
PLAIN_TEXT | Any non-formatted string.
RICH_TEXT | Any string with HTML formatting. Note that only simple tags (such as `i`, `b`, `br`, etc.) are allowed.
DATE | Any date. It expects a time value, eg. the result of `Date.getTime()`.
NUMBER | Any numeric value.
COLOR | Any valid CSS colour value, such as `blue`, `#0000FF`, etc.
MONEY | Any plain numeric value. It is automatically formatted when rendered.
RELATION | A value that is used in another dataset. Ex. Users in a system with groups may have a `groupId` property. When this data type is used for a column, the corresponding `Group` object is automatically retrieved, and can be rendered however you want.
CUSTOM | Anything that does not fall into the above categories.

There's also a self-explanatory `SortDirection` enum that is referenced below, with values of `ASCENDING` and `DESCENDING`.

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
propertyPath | string | Where the property lies in your model. Ex. if you have `UserModel { id: string }`, and you want an ID column, you would write `propertyPath: 'id'`.

## Code Samples

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