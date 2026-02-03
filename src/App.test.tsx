import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

vi.mock('video.js', () => ({
  default: vi.fn(() => ({
    dispose: vi.fn(),
    src: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    currentTime: vi.fn(() => 0),
    duration: vi.fn(() => 0),
    paused: vi.fn(() => true),
    pause: vi.fn(),
    el: vi.fn(() => document.createElement('div')),
  })),
}))

import videojs from 'video.js'

describe('App', () => {
  it('loads default source and allows changing it', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('video-player')).toBeInTheDocument()
    expect(videojs).toHaveBeenCalled()

    const input = screen.getByRole('textbox', { name: /video source url/i })
    expect(input).toHaveValue(
      'https://storage.googleapis.com/sohonet-interview-video-sample-public/1040056094289814902/manifests/master_stage_3.m3u8',
    )

    const player = (videojs as unknown as { mock: { results: Array<{ value: { src: (arg: unknown) => void } }> } }).mock
      .results[0]?.value
    expect(player).toBeTruthy()

    await user.clear(input)
    await user.type(input, 'https://example.com/other.m3u8{enter}')

    expect(player.src).toHaveBeenCalledWith({
      src: 'https://example.com/other.m3u8',
      type: 'application/x-mpegURL',
    })
  })
})
