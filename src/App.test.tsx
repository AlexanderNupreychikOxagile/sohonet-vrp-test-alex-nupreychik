import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('video.js', () => ({
  default: vi.fn(() => ({ dispose: vi.fn(), src: vi.fn() })),
}))

import videojs from 'video.js'

describe('App', () => {
  it('renders video player shell', () => {
    render(<App />)

    expect(screen.getByTestId('video-player')).toBeInTheDocument()
    expect(videojs).toHaveBeenCalled()
  })
})
