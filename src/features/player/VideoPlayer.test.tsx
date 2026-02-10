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

import videojs from 'video.js'
import { VideoPlayer } from './VideoPlayer'

let makePlayerImpl: (el: HTMLElement) => PlayerMock

function makePlayer(el: HTMLElement) {
  return makePlayerImpl(el)
}

vi.mock('video.js', async () => {
  const { createVideojsMock } = await import('../../test/videojsMock')
  return createVideojsMock((el: unknown) => makePlayer(el as HTMLElement))
})

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
    addChild: vi.fn((Child: unknown, options: unknown, index: number) => {
      const Comp =
        typeof Child === 'string'
          ? (videojs as unknown as { getComponent: (n: string) => unknown }).getComponent(Child)
          : Child
      type VjsCtor = new (p: unknown, o: unknown) => { el: () => HTMLElement }
      const inst = new (Comp as VjsCtor)(player, options)
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
    makePlayerImpl = (el) => createPlayerMock({ paused: false, el })
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    expect(await screen.findByRole('button', { name: 'Step -1f' })).toBeDisabled()
    expect(await screen.findByRole('button', { name: 'Step +1f' })).toBeDisabled()
  })

  it('steps by one frame when paused', async () => {
    const user = userEvent.setup()
    let player: PlayerMock | null = null
    const mustPlayer = () => {
      if (!player) throw new Error('Expected player to be set')
      return player
    }
    makePlayerImpl = (el) => {
      player = createPlayerMock({ paused: true, time: 1, el })
      return player
    }
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    await user.click(await screen.findByRole('button', { name: 'Step +1f' }))

    const calls = mustPlayer().currentTime.mock.calls as unknown[][]
    const last = calls[calls.length - 1]?.[0] as number
    expect(last).toBeCloseTo(1 + 1 / 30, 6)
    expect(mustPlayer().pause).toHaveBeenCalled()
  })

  it('seeks by 5 seconds', async () => {
    const user = userEvent.setup()
    let player: PlayerMock | null = null
    const mustPlayer = () => {
      if (!player) throw new Error('Expected player to be set')
      return player
    }
    makePlayerImpl = (el) => {
      player = createPlayerMock({ paused: true, time: 10, el })
      return player
    }
    render(<VideoPlayer src="https://example.com/a.m3u8" />)

    await user.click(await screen.findByRole('button', { name: 'Seek +5s' }))

    const calls = mustPlayer().currentTime.mock.calls as unknown[][]
    const last = calls[calls.length - 1]?.[0] as number
    expect(last).toBeCloseTo(15, 6)
  })

  it('renders timecode in control bar', async () => {
    makePlayerImpl = (el) => createPlayerMock({ paused: true, el })
    render(<VideoPlayer src="https://example.com/a.m3u8" />)
    expect(await screen.findByText('00:00:00.000 / 00:00:00.000')).toBeInTheDocument()
  })
})

