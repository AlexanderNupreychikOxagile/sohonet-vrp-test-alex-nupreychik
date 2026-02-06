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

    const onKeyDown = (e: KeyboardEvent) => {
      if (!handlersRef.current.enabled) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handlersRef.current.togglePlayPause()
        return
      }

      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        handlersRef.current.seekBySeconds(-5)
        return
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault()
        handlersRef.current.seekBySeconds(5)
        return
      }

      if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        handlersRef.current.openAddComment()
      }
    }

    const el = target || document
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [target])
}

