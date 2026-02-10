import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddCommentModal } from './AddCommentModal'

describe('AddCommentModal', () => {
  it('renders when open and calls callbacks', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSubmit = vi.fn()

    render(
      <AddCommentModal
        open
        time={12.324}
        author=""
        text=""
        onAuthorChange={() => {}}
        onTextChange={() => {}}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: /add comment/i })).toBeInTheDocument()
    expect(screen.getByText('00:00:12.324')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: /^add$/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('closes on overlay pointer down', () => {
    const onClose = vi.fn()

    render(
      <AddCommentModal
        open
        time={0}
        author=""
        text=""
        onAuthorChange={() => {}}
        onTextChange={() => {}}
        onClose={onClose}
        onSubmit={() => {}}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

