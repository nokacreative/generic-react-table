import { useCallback, useEffect, useRef } from 'react'

export function useClickOutside(
  isActive: boolean,
  onClickOutside: () => void,
  manualAvoidClasses?: string[]
) {
  const ref = useRef<HTMLDivElement>(null)

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClickOutside()
    }
  }

  function onDocumentClicked(e: MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      if (manualAvoidClasses) {
        const element = e.target as HTMLElement
        const elementClasses =
          element && element.className && typeof element.className === 'string'
            ? element.className.split(' ')
            : []
        if (elementClasses.some((c) => manualAvoidClasses.includes(c))) {
          return
        }
      }
      onClickOutside()
    }
  }

  const keydownCallback = useCallback(onKeydown, [])
  const clickCallback = useCallback(onDocumentClicked, [])

  function addListeners() {
    document.addEventListener('keydown', keydownCallback, true)
    document.addEventListener('click', clickCallback, true)
  }

  function removeListeners() {
    document.removeEventListener('keydown', keydownCallback, true)
    document.removeEventListener('click', clickCallback, true)
  }

  useEffect(() => {
    if (isActive) {
      addListeners()
    } else {
      removeListeners()
    }
  }, [isActive])

  useEffect(() => {
    return () => {
      removeListeners()
    }
  }, [])

  return ref
}
