import { useRef, useState } from 'react'
import './App.css'
import { VideoPlayer, type VideoPlayerHandle } from '../features/player/VideoPlayer'
import { addComment, type Comment } from '../features/comments/comment'
import { CommentsBoard } from '../features/comments/CommentsBoard'
import { AddCommentModal } from '../features/comments/AddCommentModal'
import { useReviewHotkeys } from './hooks/useReviewHotkeys'

const DEFAULT_SRC =
  'https://storage.googleapis.com/sohonet-interview-video-sample-public/1040056094289814902/manifests/master_stage_3.m3u8'

function App() {
  const playerRef = useRef<VideoPlayerHandle | null>(null)
  const [value, setValue] = useState(DEFAULT_SRC)
  const [src, setSrc] = useState(DEFAULT_SRC)
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
    const player = playerRef.current
    const time = player?.getTime() || 0
    player?.pause()
    setAddTime(time)
    setAddOpen(true)
  }

  const handleCloseAddComment = () => {
    setAddOpen(false)
    setText('')
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
    setSrc(next)
  }

  const handleToggleResolved = (id: string) => {
    setComments((prev) =>
      prev.map((x) => (x.id === id ? { ...x, resolved: !x.resolved } : x)),
    )
  }

  const handleAddComment = () => {
    const t = text.trim()
    if (!t) return

    setComments((prev) => addComment(prev, { time: addTime, author, text: t }))
    setText('')
    setAddOpen(false)
  }

  return (
    <div className="shell">
      <form
        className="source"
        onSubmit={handleSourceSubmit}
      >
        <input
          className="sourceInput"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste .m3u8 URL"
          aria-label="Video source URL"
        />
        <button className="sourceButton" type="submit">
          Open
        </button>
      </form>

      <div className="layout">
        <div className="playerBox">
          <VideoPlayer ref={playerRef} src={src} />
        </div>

        <div className="comments">
          <CommentsBoard
            comments={comments}
            onSeek={(time) => playerRef.current?.seek(time)}
            onToggleResolved={handleToggleResolved}
          />

          <button className="commentOpen" type="button" onClick={handleOpenAddComment}>
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
