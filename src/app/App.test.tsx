import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type PlayerMock = ReturnType<typeof createPlayerMock>

function getPlayerMock() {
  const mock = (videojs as unknown as { mock: { results: Array<{ value: PlayerMock }> } }).mock
  return mock.results[mock.results.length - 1]?.value
}

function createPlayerMock() {
  let t = 12.324
  const currentTime = vi.fn((next?: number) => {
    if (next !== undefined) t = next
    return t
  })

  const el = document.createElement('div')
  const controlBarEl = document.createElement('div')
  controlBarEl.className = 'vjs-control-bar'
  el.appendChild(controlBarEl)

  const children: Array<{ el: () => HTMLElement }> = []
  const player: Record<string, unknown> = {
    dispose: vi.fn(),
    src: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    ready: vi.fn((cb: () => void) => cb()),
    currentTime,
    duration: vi.fn(() => 0),
    paused: vi.fn(() => true),
    pause: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    el: vi.fn(() => el),
  }

  const controlBarComp = {
    addChild: vi.fn((
      Child: unknown,
      options: unknown,
      index: number,
    ) => {
      const Comp =
        typeof Child === 'string'
          ? (videojs as unknown as { getComponent: (n: string) => unknown }).getComponent(Child)
          : Child
      const inst = new (Comp as new (p: unknown, o: unknown) => { el: () => HTMLElement })(player, options)
      children.splice(index, 0, inst)
      const before = controlBarEl.children.item(index) || null
      controlBarEl.insertBefore(inst.el(), before)
      return inst
    }),
    children: () => children,
  }

  ;(player as { getChild: (name: string) => unknown }).getChild = vi.fn((name: string) =>
    name === 'controlBar' || name === 'ControlBar' ? controlBarComp : null,
  )

  return player as unknown as PlayerMock
}

vi.mock('video.js', () => {
  const registry = new Map<string, unknown>()

  class MockComponent {
    options_: Record<string, unknown>
    player_: unknown
    el_: HTMLElement

    constructor(player: unknown, options: unknown) {
      this.player_ = player
      this.options_ = (options as Record<string, unknown>) || {}
      this.el_ = this.createEl()
    }

    createEl() {
      return document.createElement('div')
    }

    el() {
      return this.el_
    }

    player() {
      return this.player_
    }

    addClass(c: string) {
      this.el_.classList.add(c)
    }

    controlText(t: string) {
      this.el_.setAttribute('aria-label', t)
      this.el_.setAttribute('title', t)
      const span = document.createElement('span')
      span.className = 'vjs-control-text'
      span.textContent = t
      this.el_.appendChild(span)
    }

    dispose() {}
  }

  class MockButton extends MockComponent {
    createEl() {
      const b = document.createElement('button')
      b.type = 'button'
      const icon = document.createElement('span')
      icon.className = 'vjs-icon-placeholder'
      b.appendChild(icon)
      b.addEventListener('click', () => {
        ;(this as unknown as { handleClick?: () => void }).handleClick?.()
      })
      return b
    }
  }

  const fn = vi.fn(() => createPlayerMock())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(fn as any).getComponent = (name: string) => {
    if (name === 'Button') return MockButton
    if (name === 'Component') return MockComponent
    return registry.get(name)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(fn as any).registerComponent = (name: string, comp: unknown) => {
    registry.set(name, comp)
  }

  return { default: fn }
})

import videojs from 'video.js'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: false, text: async () => '' })) as unknown as typeof fetch,
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('loads source, adds comment, and seeks on click', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('video-player')).toBeInTheDocument()
    expect(videojs).toHaveBeenCalled()

    const input = screen.getByRole('textbox', { name: /video source url/i })
    expect(input).not.toHaveValue('')

    const player = getPlayerMock()
    expect(player).toBeTruthy()

    await user.clear(input)
    await user.type(input, 'https://example.com/other.m3u8{enter}')

    expect(player.src).toHaveBeenCalledWith({
      src: 'https://example.com/other.m3u8',
      type: 'application/x-mpegURL',
    })

    await user.click(screen.getByRole('button', { name: /add comment/i }))

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

  it('supports keyboard shortcuts', async () => {
    render(<App />)

    const player = getPlayerMock()
    expect(player).toBeTruthy()

    await new Promise((r) => setTimeout(r, 0))

    fireEvent.keyDown(document, { code: 'Space', key: ' ' })
    expect(player.play).toHaveBeenCalled()

    fireEvent.keyDown(document, { code: 'ArrowRight', key: 'ArrowRight' })
    const calls = (player.currentTime as unknown as { mock: { calls: unknown[][] } }).mock.calls
    const last = calls[calls.length - 1]?.[0] as number
    expect(last).toBeCloseTo(12.324 + 5, 6)

    fireEvent.keyDown(document, { code: 'KeyC', key: 'c' })
    expect(screen.getByRole('dialog', { name: /add comment/i })).toBeInTheDocument()

    ;(player.currentTime as unknown as { mock: { calls: unknown[][] } }).mock.calls.length = 0
    fireEvent.keyDown(document, { code: 'ArrowRight', key: 'ArrowRight' })
    expect((player.currentTime as unknown as { mock: { calls: unknown[][] } }).mock.calls.length).toBe(0)
  })
})
