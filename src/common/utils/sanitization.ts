import sanitizeHtml, { SanitizationOptions } from 'sanitize-html-react'

export enum HtmlSanitizationMode {
  /** No HTML allowed */
  PLAIN,
  /** Basic formatting, but no linebreaks allowed */
  INLINE,
  /** Linebreaks + basic formatting */
  RICH,
}

const htmlSanitizationSettings: {
  [mode in HtmlSanitizationMode]: SanitizationOptions
} = {
  [HtmlSanitizationMode.PLAIN]: {
    allowedTags: [],
    allowedAttributes: [],
  },
  [HtmlSanitizationMode.INLINE]: {
    allowedTags: ['b', 'i', 'u', 'strikethrough'],
    allowedAttributes: [],
  },
  [HtmlSanitizationMode.RICH]: {
    allowedTags: ['b', 'i', 'u', 'strikethrough', 'br', 'small'],
    allowedAttributes: [],
  },
}

export function sanitizeHtmlString(html: string, mode: HtmlSanitizationMode) {
  return sanitizeHtml(html, htmlSanitizationSettings[mode])
}
