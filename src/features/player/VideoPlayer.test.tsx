import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

type PlayerMock = {
  dispose: ReturnType<typeof vi.fn>
  src: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  ready: ReturnType<typeof vi.fn>
  getChild: ReturnType<typeof vi.fn>
  currentTime: ReturnType<typeof vi.fn>
  duration: ReturnType<typeof vi.fn>
  paused: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  el: ReturnType<typeof vi.fn>
}

vi.mock('video.js', () => {
  const registry = new Map<string, unknown>()

  class MockComponent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options_: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player_: any
    el_: HTMLElement

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(player: any, options: any) {
      this.player_ = player
      this.options_ = options || {}
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(this as any).handleClick?.()
      })
      return b
    }
  }

  const fn = vi.fn((el: HTMLElement) => makePlayer(el))
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
import { VideoPlayer } from './VideoPlayer'

let makePlayer: (el: HTMLElement) => PlayerMock

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: false, text: async () => '' })) as unknown as typeof fetch,
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function createPlayerMock({ paused, time = 0, el }: { paused: boolean; time?: number; el: HTMLElement }) {
  let t = time

  const currentTime = vi.fn((next?: number) => {
    if (next !== undefined) t = next
    return t
  })

  const controlBar = document.createElement('div')
  controlBar.className = 'vjs-control-bar'
  const play = document.createElement('button')
  play.className = 'vjs-play-control'
  controlBar.appendChild(play)
  el.appendChild(controlBar)

  const children: Array<{ el: () => HTMLElement }> = []
  const controlBarComp = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addChild: vi.fn((Child: any, options: any, index: number) => {
      const Comp =
        typeof Child === 'string'
          ? (videojs as unknown as { getComponent: (n: string) => unknown }).getComponent(Child)
          : Child
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inst = new (Comp as any)(player, options) as any
      children.splice(index, 0, inst)
      const before = controlBar.children.item(index) || null
      controlBar.insertBefore(inst.el(), before)
      return inst
    }),
    children: () => children,
  }

  const player = {
    dispose: vi.fn(),
    src: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    ready: vi.fn((cb: () => void) => cb()),
    getChild: vi.fn((name: string) =>
      name === 'controlBar' || name === 'ControlBar' ? controlBarComp : null,
    ),
    currentTime,
    duration: vi.fn(() => 0),
    paused: vi.fn(() => paused),
    pause: vi.fn(),
    el: vi.fn(() => el),
  } satisfies PlayerMock

  return player
}

describe('VideoPlayer', () => {
  it('disables frame step buttons while playing', async () => {
    makePlayer = (el) => createPlayerMock({ paused: false, el })
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    expect(await screen.findByRole('button', { name: 'Step -1f' })).toBeDisabled()
    expect(await screen.findByRole('button', { name: 'Step +1f' })).toBeDisabled()
  })

  it('steps by one frame when paused', async () => {
    const user = userEvent.setup()
    let player: PlayerMock | null = null
    makePlayer = (el) => {
      player = createPlayerMock({ paused: true, time: 1, el })
      return player
    }
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    await user.click(await screen.findByRole('button', { name: 'Step +1f' }))

    const calls = ((player as PlayerMock).currentTime as unknown as { mock: { calls: unknown[][] } }).mock.calls
    const last = calls[calls.length - 1]?.[0] as number
    expect(last).toBeCloseTo(1 + 1 / 30, 6)
    expect((player as PlayerMock).pause).toHaveBeenCalled()
  })

  it('seeks by 5 seconds', async () => {
    const user = userEvent.setup()
    let player: PlayerMock | null = null
    makePlayer = (el) => {
      player = createPlayerMock({ paused: true, time: 10, el })
      return player
    }
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    await user.click(await screen.findByRole('button', { name: 'Seek +5s' }))

    const calls = ((player as PlayerMock).currentTime as unknown as { mock: { calls: unknown[][] } }).mock.calls
    const last = calls[calls.length - 1]?.[0] as number
    expect(last).toBeCloseTo(15, 6)
  })

  it('renders timecode in control bar', async () => {
    makePlayer = (el) => createPlayerMock({ paused: true, el })
    render(<VideoPlayer src="https://example.com/a.m3u8" />)
    expect(await screen.findByText('00:00:00.000 / 00:00:00.000')).toBeInTheDocument()
  })
})

