export type IdMapped<T> = { [key: string]: T }

export interface SanitizationOptions {
  allowedTags?: string[]
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
