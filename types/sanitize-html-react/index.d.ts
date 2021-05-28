declare module 'sanitize-html-react' {
  export interface SanitizationOptions {
    allowedTags: string[]
    allowedAttributes?: { [tag: string]: string[] }
    transformTags?: {
      [tag: string]:
        | string
        | ((
            tagName: string,
            attribs: { [attr: string]: string }
          ) => { tagName: string; attribs: { [attr: string]: string } })
    }
  }
  function sanitizeHtml(dirty: string, options: SanitizationOptions): string
  export default sanitizeHtml
}
