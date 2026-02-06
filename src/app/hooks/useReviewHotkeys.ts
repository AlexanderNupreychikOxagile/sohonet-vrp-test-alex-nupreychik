import { useEffect, useRef } from 'react'

type UseReviewHotkeysParams = {
  enabled?: boolean
  target?: HTMLElement | null
  togglePlayPause: () => void
  seekBySeconds: (deltaSeconds: number) => void
  openAddComment: () => void
}

function isTypingTarget(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
}

function shouldIgnoreHotkey(e: KeyboardEvent, enabled: boolean) {
  if (!enabled) return true
  if (e.metaKey || e.ctrlKey || e.altKey) return true
  return isTypingTarget(e.target)
}

type Hotkey = 'togglePlayPause' | 'seekBack' | 'seekForward' | 'openAddComment'

function resolveHotkey(e: KeyboardEvent): Hotkey | null {
  if (e.code === 'Space' || e.key === ' ') return 'togglePlayPause'
  if (e.code === 'ArrowLeft') return 'seekBack'
  if (e.code === 'ArrowRight') return 'seekForward'
  if (e.code === 'KeyC' || e.key.toLowerCase() === 'c') return 'openAddComment'
  return null
}

export function useReviewHotkeys({
  enabled = true,
  target,
  togglePlayPause,
  seekBySeconds,
  openAddComment,
}: UseReviewHotkeysParams) {
  const handlersRef = useRef({ enabled, togglePlayPause, seekBySeconds, openAddComment })
  useEffect(() => {
    handlersRef.current = { enabled, togglePlayPause, seekBySeconds, openAddComment }
  }, [enabled, togglePlayPause, seekBySeconds, openAddComment])

  useEffect(() => {
    if (target === null) return

    const onKeyDown = (evt: Event) => {
      const e = evt as KeyboardEvent
      const h = handlersRef.current
      if (shouldIgnoreHotkey(e, h.enabled)) return

      const hotkey = resolveHotkey(e)
      if (!hotkey) return

      e.preventDefault()
      switch (hotkey) {
        case 'togglePlayPause':
          h.togglePlayPause()
          break
        case 'seekBack':
          h.seekBySeconds(-5)
          break
        case 'seekForward':
          h.seekBySeconds(5)
          break
        case 'openAddComment':
          h.openAddComment()
          break
      }
    }

    const el = target || document
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [target])
}

