export function getNestedValue(obj: any, path: string) {
  return path
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
    .reduce((o, k) => ((o || {}) as any)[k], obj)
}

export function setNestedValue(obj: any, path: string, value: any) {
  if (obj === undefined) return obj
  const pathParts = path.toString().match(/[^.[\]]+/g) || []
  pathParts
    .slice(0, -1)
    .reduce(
      (a, c) => (Object(a[c]) === a[c] ? a[c] : (a[c] = !Number.isNaN(c) ? [] : {})),
      obj
    )[pathParts[pathParts.length - 1]] = value
  return obj
}

export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<F>) =>
    new Promise<ReturnType<F>>((resolve) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor)
    })
}

export function objectIsEmpty(obj: any) {
  return Object.keys(obj).length === 0
}
