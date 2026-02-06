import { useMemo } from 'react'
import { type Comment } from './comment'
import { formatTimecode } from '../../shared/utils/formatTimecode'
import styles from './CommentsBoard.module.css'

type CommentsBoardProps = {
  comments: Comment[]
  onSeek: (time: number) => void
  onToggleResolved: (id: string) => void
}

export function CommentsBoard({ comments, onSeek, onToggleResolved }: CommentsBoardProps) {
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => a.time - b.time)
  }, [comments])

  return (
    <section className={styles.panel} aria-label="Comments">
      {sortedComments.length === 0 ? (
        <div className={styles.commentEmpty}>No comments yet</div>
      ) : (
        <ul className={styles.commentList}>
          {sortedComments.map((c) => (
            <li
              key={c.id}
              className={`${styles.commentItem} ${c.resolved ? styles.commentItemResolved : styles.commentItemOpen}`}
            >
              <div className={styles.commentHeader}>
                <button
                  className={styles.commentJump}
                  type="button"
                  onClick={() => onSeek(c.time)}
                >
                  <span className={styles.commentMeta}>
                    <span className={styles.commentTime}>{formatTimecode(c.time)}</span>
                    <span className={styles.commentAuthorText}>{c.author}</span>
                  </span>
                </button>

                <label className={styles.commentResolvedToggle}>
                  <input
                    type="checkbox"
                    aria-label="Resolved"
                    checked={c.resolved}
                    onChange={() => onToggleResolved(c.id)}
                  />
                  <span className={styles.commentResolvedPill}>{c.resolved ? 'Reopen' : 'Resolve'}</span>
                </label>
              </div>

              <button
                className={styles.commentBodyJump}
                type="button"
                onClick={() => onSeek(c.time)}
              >
                <span className={styles.commentBody}>{c.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

