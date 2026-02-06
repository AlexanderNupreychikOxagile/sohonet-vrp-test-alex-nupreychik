import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentsBoard } from './CommentsBoard'

describe('CommentsBoard', () => {
  it('renders empty state', () => {
    render(<CommentsBoard comments={[]} onSeek={() => {}} onToggleResolved={() => {}} />)
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument()
  })

  it('calls onSeek and onToggleResolved', async () => {
    const user = userEvent.setup()
    const onSeek = vi.fn()
    const onToggleResolved = vi.fn()

    render(
      <CommentsBoard
        comments={[
          { id: 'c_1', time: 12.324, author: 'Alice', text: 'Hello!!', resolved: false },
        ]}
        onSeek={onSeek}
        onToggleResolved={onToggleResolved}
      />,
    )

    await user.click(screen.getByRole('button', { name: /hello!!/i }))
    expect(onSeek).toHaveBeenCalledWith(12.324)

    await user.click(screen.getByRole('checkbox', { name: /resolved/i }))
    expect(onToggleResolved).toHaveBeenCalledWith('c_1')
  })
})

