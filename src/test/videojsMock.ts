import { vi } from 'vitest'

type VideojsMockFn = ReturnType<typeof vi.fn> & {
  getComponent: (name: string) => unknown
  registerComponent: (name: string, comp: unknown) => void
}

export function createVideojsMock(createPlayer: (...args: unknown[]) => unknown) {
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

    createEl(): HTMLElement {
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
    createEl(): HTMLElement {
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

  const fn = vi.fn((...args: unknown[]) => createPlayer(...args)) as unknown as VideojsMockFn
  fn.getComponent = (name: string) => {
    if (name === 'Button') return MockButton
    if (name === 'Component') return MockComponent
    return registry.get(name)
  }
  fn.registerComponent = (name: string, comp: unknown) => {
    registry.set(name, comp)
  }

  return { default: fn }
}

