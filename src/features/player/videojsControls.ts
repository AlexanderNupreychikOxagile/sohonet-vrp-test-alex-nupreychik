import videojs from 'video.js'
import { formatTimecode } from '../../shared/utils/formatTimecode'

const VjsButton = videojs.getComponent('Button') as unknown as new (p: unknown, o: unknown) => {
  addClass: (c: string) => void
  controlText: (t: string) => void
  el: () => HTMLElement
  options_: { onClick?: () => void; className?: string; iconClassName?: string; controlText?: string }
}

class VrpControlButton extends VjsButton {
  constructor(p: unknown, o: unknown) {
    super(p, o)
    const opt = this.options_ || {}
    if (opt.controlText) {
      this.controlText(opt.controlText)
      this.el().setAttribute('aria-label', opt.controlText)
      this.el().setAttribute('title', opt.controlText)
    }
    for (const c of opt.className?.split(' ') || []) this.addClass(c)
    for (const c of opt.iconClassName?.split(' ') || []) this.addClass(c)
  }

  handleClick() {
    this.options_?.onClick?.()
  }
}

const VjsComponent = videojs.getComponent('Component') as unknown as new (p: unknown, o: unknown) => {
  el: () => HTMLElement
  player: () => VjsPlayerLike
}

class VrpTimecode extends VjsComponent {
  private update: () => void

  constructor(p: unknown, o: unknown) {
    super(p, o)
    this.update = () => {
      const pl = this.player()
      const t = pl.currentTime() || 0
      const d = pl.duration?.() || 0
      this.el().textContent = `${formatTimecode(t)} / ${formatTimecode(d)}`
    }

    this.update()
    this.player().on('timeupdate', this.update)
    this.player().on('durationchange', this.update)
  }

  createEl() {
    const el = document.createElement('div')
    el.className = 'vjs-control vjs-visible-text vrp-timecode'
    el.setAttribute('aria-label', 'Timecode')
    return el
  }

  dispose() {
    this.player().off('timeupdate', this.update)
    this.player().off('durationchange', this.update)
    // @ts-expect-error video.js base dispose exists at runtime
    super.dispose()
  }
}

const CONTROL_BUTTON_NAME = 'VrpControlButton'
const TIMECODE_NAME = 'VrpTimecode'

const videojsRegistry = videojs as unknown as {
  getComponent: (name: string) => unknown
  registerComponent?: (name: string, comp: unknown) => void
}

if (!videojsRegistry.getComponent(CONTROL_BUTTON_NAME)) {
  videojsRegistry.registerComponent?.(CONTROL_BUTTON_NAME, VrpControlButton)
}

if (!videojsRegistry.getComponent(TIMECODE_NAME)) {
  videojsRegistry.registerComponent?.(TIMECODE_NAME, VrpTimecode)
}

type VjsControlBarLike = {
  addChild: (name: string, options: unknown, index: number) => unknown
  children: () => unknown[]
}

type VjsPlayerLike = {
  currentTime: () => number
  duration?: () => number
  paused: () => boolean
  on: (event: string, cb: () => void) => void
  off: (event: string, cb: () => void) => void
  getChild: (name: string) => VjsControlBarLike | null
}

type ButtonLike = { el: () => HTMLElement; dispose?: () => void }
type TimecodeLike = { dispose?: () => void }

export function setupVrpReviewControls(
  player: VjsPlayerLike,
  {
    stepFrame,
    seekBy,
  }: {
    stepFrame: (dir: -1 | 1) => void
    seekBy: (deltaSeconds: number) => void
  },
) {
  const controlBar = player.getChild('ControlBar')
  if (!controlBar) return () => {}

  const seekBack = controlBar.addChild(
    CONTROL_BUTTON_NAME,
    {
      controlText: 'Seek -5s',
      className: 'vrp-controlIcon vrp-seekBack',
      iconClassName: 'vjs-skip-backward-5',
      onClick: () => seekBy(-5),
    },
    0,
  ) as ButtonLike

  const stepBack = controlBar.addChild(
    CONTROL_BUTTON_NAME,
    { controlText: 'Step -1f', className: 'vrp-controlIcon vrp-stepBack', onClick: () => stepFrame(-1) },
    1,
  ) as ButtonLike

  // After inserting two items at 0/1, play button shifts to index 2
  const stepForward = controlBar.addChild(
    CONTROL_BUTTON_NAME,
    { controlText: 'Step +1f', className: 'vrp-controlIcon vrp-stepForward', onClick: () => stepFrame(1) },
    3,
  ) as ButtonLike

  const seekForward = controlBar.addChild(
    CONTROL_BUTTON_NAME,
    {
      controlText: 'Seek +5s',
      className: 'vrp-controlIcon vrp-seekForward',
      iconClassName: 'vjs-skip-forward-5',
      onClick: () => seekBy(5),
    },
    4,
  ) as ButtonLike

  const syncStepEnabled = () => {
    const enabled = player.paused()
    for (const b of [stepBack, stepForward]) {
      const el = b.el() as HTMLButtonElement
      el.disabled = !enabled
      el.classList.toggle('vjs-disabled', !enabled)
    }
  }

  syncStepEnabled()
  player.on('pause', syncStepEnabled)
  player.on('play', syncStepEnabled)

  const timecode = controlBar.addChild(TIMECODE_NAME, {}, controlBar.children().length) as TimecodeLike

  return () => {
    player.off('pause', syncStepEnabled)
    player.off('play', syncStepEnabled)
    seekBack.dispose?.()
    stepBack.dispose?.()
    stepForward.dispose?.()
    seekForward.dispose?.()
    timecode.dispose?.()
  }
}

