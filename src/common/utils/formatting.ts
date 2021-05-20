export function chunkString(str: string, chunkSize: number) {
  const retVal = []
  let i, l
  for (i = 0, l = str.length; i < l; i += chunkSize) {
    retVal.push(str.substr(i, chunkSize))
  }
  return retVal
}

export function formatMoney(value: number) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value)
  const commaSeparatedNumber = chunkString(Math.trunc(numericValue).toString(), 3).join(
    ','
  )
  const decimals = numericValue.toFixed(2).split('.')[1]
  return `${commaSeparatedNumber}.${decimals}`
}

export function formatDate(timeValue: number, showTime: boolean, showSeconds: boolean) {
  const date = new Date(timeValue)
  const dateStr = date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  if (!showTime) {
    return dateStr
  }
  return `${dateStr} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
  })}`
}
