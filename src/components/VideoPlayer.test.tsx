import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

type PlayerMock = {
  dispose: ReturnType<typeof vi.fn>
  src: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  currentTime: ReturnType<typeof vi.fn>
  duration: ReturnType<typeof vi.fn>
  paused: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  el: ReturnType<typeof vi.fn>
}

let player: PlayerMock

vi.mock('video.js', () => ({
  default: vi.fn(() => player),
}))

import { VideoPlayer } from './VideoPlayer'

function createPlayerMock({ paused, time = 0 }: { paused: boolean; time?: number }) {
  let t = time

  const currentTime = vi.fn<(next?: number) => number>((next) => {
    if (typeof next === 'number') t = next
    return t
  })

  return {
    dispose: vi.fn(),
    src: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    currentTime,
    duration: vi.fn(() => 0),
    paused: vi.fn(() => paused),
    pause: vi.fn(),
    el: vi.fn(() => document.createElement('div')),
  } satisfies PlayerMock
}

describe('VideoPlayer', () => {
  it('disables frame step buttons while playing', () => {
    player = createPlayerMock({ paused: false })
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    expect(screen.getByRole('button', { name: '−1f' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '+1f' })).toBeDisabled()
  })

  it('steps by one frame when paused', async () => {
    const user = userEvent.setup()
    player = createPlayerMock({ paused: true, time: 1 })
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    await user.click(screen.getByRole('button', { name: '+1f' }))

    const calls = (player.currentTime as unknown as { mock: { calls: unknown[][] } }).mock.calls
    const last = calls[calls.length - 1]?.[0] as number
    expect(last).toBeCloseTo(1 + 1 / 30, 6)
    expect(player.pause).toHaveBeenCalled()
  })
})

