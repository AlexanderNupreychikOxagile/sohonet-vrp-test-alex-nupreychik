import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type PlayerMock = ReturnType<typeof createPlayerMock>

function createPlayerMock() {
  let t = 12.324
  const currentTime = vi.fn((next?: number) => {
    if (next !== undefined) t = next
    return t
  })

  return {
    dispose: vi.fn(),
    src: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    currentTime,
    duration: vi.fn(() => 0),
    paused: vi.fn(() => true),
    pause: vi.fn(),
    el: vi.fn(() => document.createElement('div')),
  }
}

vi.mock('video.js', () => ({
  default: vi.fn(() => createPlayerMock()),
}))

import videojs from 'video.js'

describe('App', () => {
  it('loads source, adds comment, and seeks on click', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('video-player')).toBeInTheDocument()
    expect(videojs).toHaveBeenCalled()

    const input = screen.getByRole('textbox', { name: /video source url/i })
    expect(input).not.toHaveValue('')

    const player = (videojs as unknown as { mock: { results: Array<{ value: PlayerMock }> } }).mock
      .results[0]?.value
    expect(player).toBeTruthy()

    await user.clear(input)
    await user.type(input, 'https://example.com/other.m3u8{enter}')

    expect(player.src).toHaveBeenCalledWith({
      src: 'https://example.com/other.m3u8',
      type: 'application/x-mpegURL',
    })

    const author = screen.getByRole('textbox', { name: /author/i })
    const comment = screen.getByRole('textbox', { name: /comment/i })
    await user.clear(author)
    await user.type(author, 'Alice')
    await user.type(comment, 'First note')
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    expect(screen.getByText('First note')).toBeInTheDocument()
    expect(screen.getByText('00:00:12.324')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /first note/i }))
    expect(player.currentTime).toHaveBeenCalledWith(12.324)

    const resolved = screen.getByRole('checkbox', { name: /resolved/i })
    await user.click(resolved)
    expect(resolved).toBeChecked()
  })
})
