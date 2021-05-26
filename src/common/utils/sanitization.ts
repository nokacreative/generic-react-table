import sanitizeHtml, { SanitizationOptions } from 'sanitize-html-react'

export enum HtmlSanitizationMode {
  /** No HTML allowed */
  PLAIN,
  /** Basic formatting, but no linebreaks allowed */
  INLINE,
  /** Linebreaks + basic formatting */
  RICH,
}

const allowedInlineTags = ['b', 'i', 'u', 'strikethrough', 'small']

const htmlSanitizationSettings: {
  [mode in HtmlSanitizationMode]: SanitizationOptions
} = {
  [HtmlSanitizationMode.PLAIN]: {
    allowedTags: [],
    allowedAttributes: [],
  },
  [HtmlSanitizationMode.INLINE]: {
    allowedTags: allowedInlineTags,
    allowedAttributes: [],
  },
  [HtmlSanitizationMode.RICH]: {
    allowedTags: [...allowedInlineTags, 'br', 'p'],
    allowedAttributes: [],
  },
}

export function sanitizeHtmlString(html: string, mode: HtmlSanitizationMode) {
  return sanitizeHtml(html, htmlSanitizationSettings[mode])
}
