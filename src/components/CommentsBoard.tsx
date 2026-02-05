import { useMemo } from 'react'
import { type Comment } from '../comments/comment'
import { formatTimecode } from '../utils/formatTimecode'

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
    <section className="panel" aria-label="Comments">
      {sortedComments.length === 0 ? (
        <div className="commentEmpty">No comments yet</div>
      ) : (
        <ul className="commentList">
          {sortedComments.map((c) => (
            <li
              key={c.id}
              className={`commentItem ${c.resolved ? 'commentItemResolved' : 'commentItemOpen'}`}
            >
              <div className="commentHeader">
                <button
                  className="commentJump"
                  type="button"
                  onClick={() => onSeek(c.time)}
                >
                  <span className="commentMeta">
                    <span className="commentTime">{formatTimecode(c.time)}</span>
                    <span className="commentAuthorText">{c.author}</span>
                  </span>
                </button>

                <label className="commentResolvedToggle">
                  <input
                    type="checkbox"
                    aria-label="Resolved"
                    checked={c.resolved}
                    onChange={() => onToggleResolved(c.id)}
                  />
                  <span className="commentResolvedPill">{c.resolved ? 'Reopen' : 'Resolve'}</span>
                </label>
              </div>

              <button
                className="commentBodyJump"
                type="button"
                onClick={() => onSeek(c.time)}
              >
                <span className="commentBody">{c.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

