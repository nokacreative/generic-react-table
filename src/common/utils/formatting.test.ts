import { formatMoney, chunkString, formatDate } from './formatting'

describe('Utils - Formatting', () => {
  describe('chunkString()', () => {
    it('properly splits a string into the specified chunk sizes', () => {
      const str = '1234567890'
      const result = chunkString(str, 3)
      expect(result).toEqual(['123', '456', '789', '0'])
    })
  })

  describe('formatMoney()', () => {
    it('properly formats numbers, rounding to two decimal places', () => {
      const num = 123.56765
      const result = formatMoney(num)
      expect(result).toEqual('123.57')
    })

    it('properly formats dirty strings, rounding to two decimal places', () => {
      const str = '123.567#6s5'
      // @ts-expect-error
      const result = formatMoney(str)
      expect(result).toEqual('123.57')
    })
  })

  describe('formatDate()', () => {
    const TIME_VALUE = new Date(2021, 5, 25, 11, 48, 53).getTime()

    it('returns the date string in the correct format when showTime is false', () => {
      const result = formatDate(TIME_VALUE, false, false)
      expect(result).toEqual('06/25/2021')
    })

    it('returns the date string in the correct format, with the formatted time (without seconds), when showTime is true', () => {
      const result = formatDate(TIME_VALUE, true, false)
      expect(result).toEqual('06/25/2021 11:48 AM')
    })

    it('returns the date string in the correct format, with the formatted time, with seconds, when showTime and showSeconds is true', () => {
      const result = formatDate(TIME_VALUE, true, true)
      expect(result).toEqual('06/25/2021 11:48:53 AM')
    })
  })
})
