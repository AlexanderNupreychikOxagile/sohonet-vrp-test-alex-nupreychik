import { describe, it, expect, vi } from 'vitest'
import { setupVrpReviewControls } from './videojsControls'

describe('setupVrpReviewControls', () => {
  it('returns noop if control bar is missing', () => {
    const player = {
      currentTime: () => 0,
      paused: () => true,
      on: vi.fn(),
      off: vi.fn(),
      getChild: () => null,
    }

    const teardown = setupVrpReviewControls(player, { stepFrame: () => {}, seekBy: () => {} })
    expect(typeof teardown).toBe('function')
    expect(() => teardown()).not.toThrow()
  })
})

