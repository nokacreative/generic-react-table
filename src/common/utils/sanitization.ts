import sanitizeHtml from 'sanitize-html-react'
import { SanitizationOptions } from '../models'

export enum HtmlSanitizationMode {
  /** No HTML allowed */
  PLAIN,
  /** Basic formatting, but no linebreaks allowed */
  INLINE,
  /** Linebreaks + basic formatting */
  RICH,
}

const allowedInlineTags = [
  'b',
  'i',
  'u',
  'strikethrough',
  'strong',
  'small',
  'em',
  'mark',
  'ins',
  'del',
  'sub',
  'sup',
]

const htmlSanitizationSettings: {
  [mode in HtmlSanitizationMode]: SanitizationOptions
} = {
  [HtmlSanitizationMode.PLAIN]: {
    allowedTags: [],
    allowedAttributes: {},
  },
  [HtmlSanitizationMode.INLINE]: {
    allowedTags: allowedInlineTags,
    allowedAttributes: {},
  },
  [HtmlSanitizationMode.RICH]: {
    allowedTags: [...allowedInlineTags, 'br', 'p'],
    allowedAttributes: {},
  },
}

export function sanitizeHtmlString(html: string, mode: HtmlSanitizationMode) {
  return sanitizeHtml(html, htmlSanitizationSettings[mode])
}

export function sanitizeHtmlStringWithCustomOptions(
  html: string,
  customOptions: SanitizationOptions
) {
  return sanitizeHtml(html, {
    ...htmlSanitizationSettings[HtmlSanitizationMode.RICH],
    customOptions,
  })
}
