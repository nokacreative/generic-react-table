export enum DataType {
  PLAIN_TEXT,
  RICH_TEXT,
  RELATION,
  DATE,
  CUSTOM,
  NUMBER,
  COLOR,
  MONEY,
}

export enum SortDirection {
  NONE = 'none',
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export enum FilterType {
  EXACT_MATCH,
  PARTIAL_MATCH,
  RANGED,
  MINIMUM,
  MAXIMUM,
}

export enum CustomFilterType {
  TEXT,
  DROPDOWN,
  NUMBER,
}
