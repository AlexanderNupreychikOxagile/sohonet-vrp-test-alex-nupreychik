import { useEffect } from 'react'
import { formatTimecode } from '../../shared/utils/formatTimecode'

type AddCommentModalProps = {
  open: boolean
  time: number
  author: string
  text: string
  onAuthorChange: (next: string) => void
  onTextChange: (next: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function AddCommentModal({
  open,
  time,
  author,
  text,
  onAuthorChange,
  onTextChange,
  onClose,
  onSubmit,
}: AddCommentModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add comment"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <div className="modalTitle">Add comment</div>
          <div className="modalMeta">{formatTimecode(time)}</div>
        </div>

        <form
          className="commentForm"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <input
            className="commentAuthor"
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            aria-label="Author"
            placeholder="Author"
          />
          <textarea
            className="commentText"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            aria-label="Comment"
            placeholder="Comment"
            rows={3}
            autoFocus
          />

          <div className="modalActions">
            <button className="modalButton" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="commentAdd" type="submit">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

