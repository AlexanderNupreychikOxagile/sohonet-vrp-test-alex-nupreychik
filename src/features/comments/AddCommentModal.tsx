import { useEffect } from 'react'
import { formatTimecode } from '../../shared/utils/formatTimecode'
import styles from './AddCommentModal.module.css'

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
    <div className={styles.modalOverlay} role="presentation" onPointerDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Add comment"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Add comment</div>
          <div className={styles.modalMeta}>{formatTimecode(time)}</div>
        </div>

        <form
          className={styles.commentForm}
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <input
            className={styles.commentAuthor}
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            aria-label="Author"
            placeholder="Author"
          />
          <textarea
            className={styles.commentText}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            aria-label="Comment"
            placeholder="Comment"
            rows={3}
            autoFocus
          />

          <div className={styles.modalActions}>
            <button className={styles.modalButton} type="button" onClick={onClose}>
              Cancel
            </button>
            <button className={styles.commentAdd} type="submit">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

