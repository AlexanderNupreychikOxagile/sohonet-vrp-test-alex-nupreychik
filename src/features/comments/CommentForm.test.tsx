import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentForm } from './CommentForm'

describe('CommentForm', () => {
  it('calls change handlers and submits', async () => {
    const user = userEvent.setup()
    const onAuthorChange = vi.fn()
    const onTextChange = vi.fn()
    const onSubmit = vi.fn()

    render(
      <CommentForm
        author=""
        text=""
        onAuthorChange={onAuthorChange}
        onTextChange={onTextChange}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: /author/i }), 'Bob')
    expect(onAuthorChange).toHaveBeenCalled()

    await user.type(screen.getByRole('textbox', { name: /comment/i }), 'Hello')
    expect(onTextChange).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /^add$/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

