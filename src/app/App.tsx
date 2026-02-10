import { useRef, useState } from 'react'
import styles from './App.module.css'
import { VideoPlayer, type VideoPlayerHandle } from '../features/player/VideoPlayer'
import { addComment, type Comment } from '../features/comments/comment'
import { CommentsBoard } from '../features/comments/CommentsBoard'
import { AddCommentModal } from '../features/comments/AddCommentModal'
import { useReviewHotkeys } from './hooks/useReviewHotkeys'
import { isHttpUrl } from '../shared/utils/isHttpUrl'

const DEFAULT_SRC =
  'https://storage.googleapis.com/sohonet-interview-video-sample-public/1040056094289814902/manifests/master_stage_3.m3u8'

function App() {
  const playerRef = useRef<VideoPlayerHandle | null>(null)
  const focusReturnRef = useRef<HTMLElement | null>(null)
  const [value, setValue] = useState(DEFAULT_SRC)
  const [src, setSrc] = useState(DEFAULT_SRC)
  const [sourceError, setSourceError] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addTime, setAddTime] = useState(0)

  const handleTogglePlayPause = () => playerRef.current?.togglePlayPause()

  const handleSeekBySeconds = (deltaSeconds: number) => {
    const player = playerRef.current
    if (!player) return
    player.seek(Math.max(0, player.getTime() + deltaSeconds))
  }

  const handleOpenAddComment = () => {
    const active = document.activeElement
    focusReturnRef.current = active instanceof HTMLElement ? active : null

    const player = playerRef.current
    const time = player?.getTime() || 0
    player?.pause()
    setAddTime(time)
    setAddOpen(true)
  }

  const handleCloseAddComment = () => {
    setAddOpen(false)
    setText('')
    focusReturnRef.current?.focus()
  }

  const handleSourceChange: NonNullable<React.ComponentProps<'input'>['onChange']> = (e) => {
    setValue(e.target.value)
    if (sourceError) setSourceError('')
  }

  useReviewHotkeys({
    enabled: !addOpen,
    togglePlayPause: handleTogglePlayPause,
    seekBySeconds: handleSeekBySeconds,
    openAddComment: handleOpenAddComment,
  })

  const handleSourceSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (e) => {
    e.preventDefault()
    const next = value.trim()
    if (!next) return
    if (!isHttpUrl(next)) {
      setSourceError('URL must start with http:// or https://')
      return
    }
    setSourceError('')
    setSrc(next)
  }

  const handleToggleResolved = (id: string) => {
    setComments((prev) =>
      prev.map((x) => (x.id === id ? { ...x, resolved: !x.resolved } : x)),
    )
  }

  const handleAddComment = () => {
    const a = author.trim()
    const t = text.trim()
    if (!a || !t) return

    setComments((prev) => addComment(prev, { time: addTime, author: a, text: t }))
    setText('')
    setAddOpen(false)
  }

  return (
    <div className={styles.shell}>
      <form
        className={styles.source}
        onSubmit={handleSourceSubmit}
      >
        <input
          className={styles.sourceInput}
          value={value}
          onChange={handleSourceChange}
          placeholder="Paste .m3u8 URL"
          aria-label="Video source URL"
          aria-invalid={!!sourceError}
        />
        <button className={styles.sourceButton} type="submit">
          Open
        </button>
      </form>

      {sourceError ? (
        <div role="alert" className={styles.sourceError}>
          {sourceError}
        </div>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.playerBox}>
          <VideoPlayer ref={playerRef} src={src} />
        </div>

        <div className={styles.comments}>
          <CommentsBoard
            comments={comments}
            onSeek={(time) => playerRef.current?.seek(time)}
            onToggleResolved={handleToggleResolved}
          />

          <button className={styles.commentOpen} type="button" onClick={handleOpenAddComment}>
            Add comment
          </button>
        </div>
      </div>

      <AddCommentModal
        open={addOpen}
        time={addTime}
        author={author}
        text={text}
        onAuthorChange={setAuthor}
        onTextChange={setText}
        onClose={handleCloseAddComment}
        onSubmit={handleAddComment}
      />
    </div>
  )
}

export default App
