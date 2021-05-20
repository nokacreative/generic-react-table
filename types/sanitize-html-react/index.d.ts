declare module 'sanitize-html-react' {
  export interface SanitizationOptions {
    allowedTags: string[]
    allowedAttributes: string[]
    transformTags?: { [tag: string]: string }
  }
  function sanitizeHtml(dirty: string, options: SanitizationOptions): string
  export default sanitizeHtml
}
