import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useReviewHotkeys } from './useReviewHotkeys'

function Harness({
  enabled = true,
  togglePlayPause,
  seekBySeconds,
  openAddComment,
}: {
  enabled?: boolean
  togglePlayPause: () => void
  seekBySeconds: (d: number) => void
  openAddComment: () => void
}) {
  useReviewHotkeys({ enabled, togglePlayPause, seekBySeconds, openAddComment })
  return null
}

describe('useReviewHotkeys', () => {
  it('dispatches actions', () => {
    const togglePlayPause = vi.fn()
    const seekBySeconds = vi.fn()
    const openAddComment = vi.fn()

    render(
      <Harness
        togglePlayPause={togglePlayPause}
        seekBySeconds={seekBySeconds}
        openAddComment={openAddComment}
      />,
    )

    fireEvent.keyDown(document, { code: 'Space', key: ' ' })
    expect(togglePlayPause).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(document, { code: 'ArrowLeft', key: 'ArrowLeft' })
    expect(seekBySeconds).toHaveBeenCalledWith(-5)

    fireEvent.keyDown(document, { code: 'ArrowRight', key: 'ArrowRight' })
    expect(seekBySeconds).toHaveBeenCalledWith(5)

    fireEvent.keyDown(document, { code: 'KeyC', key: 'c' })
    expect(openAddComment).toHaveBeenCalledTimes(1)
  })

  it('ignores when disabled', () => {
    const togglePlayPause = vi.fn()
    render(
      <Harness
        enabled={false}
        togglePlayPause={togglePlayPause}
        seekBySeconds={() => {}}
        openAddComment={() => {}}
      />,
    )

    fireEvent.keyDown(document, { code: 'Space', key: ' ' })
    expect(togglePlayPause).not.toHaveBeenCalled()
  })

  it('ignores typing target', () => {
    const togglePlayPause = vi.fn()
    render(
      <div>
        <input aria-label="x" />
        <Harness
          togglePlayPause={togglePlayPause}
          seekBySeconds={() => {}}
          openAddComment={() => {}}
        />
      </div>,
    )

    const input = document.querySelector('input') as HTMLInputElement
    fireEvent.keyDown(input, { code: 'Space', key: ' ', target: input })
    expect(togglePlayPause).not.toHaveBeenCalled()
  })
})

