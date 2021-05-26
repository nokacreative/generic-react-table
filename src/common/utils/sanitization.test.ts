import { HtmlSanitizationMode, sanitizeHtmlString } from './sanitization'

const HTML_STR = '<b>1</b><p>2</p>3<br /><table>4</table><small><u>5</u></small>'

describe('Utils - Sanitization', () => {
  describe('sanitizeHtmlString()', () => {
    it('removes all HTML when the mode is HtmlSanitizationMode.PLAIN', () => {
      const result = sanitizeHtmlString(HTML_STR, HtmlSanitizationMode.PLAIN)
      expect(result).toEqual('12345')
    })

    it('removes all non-formatting HTML when the mode is HtmlSanitizationMode.INLINE', () => {
      const result = sanitizeHtmlString(HTML_STR, HtmlSanitizationMode.INLINE)
      expect(result).toEqual('<b>1</b>234<small><u>5</u></small>')
    })

    it('removes all non-formatting and non-spacing (line-break) HTML when the mode is HtmlSanitizationMode.RICH', () => {
      const result = sanitizeHtmlString(HTML_STR, HtmlSanitizationMode.RICH)
      expect(result).toEqual('<b>1</b><p>2</p>3<br />4<small><u>5</u></small>')
    })
  })
})
