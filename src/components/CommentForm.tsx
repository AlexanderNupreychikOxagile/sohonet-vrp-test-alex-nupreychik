type CommentFormProps = {
  author: string
  text: string
  onAuthorChange: (next: string) => void
  onTextChange: (next: string) => void
  onSubmit: () => void
}

export function CommentForm({
  author,
  text,
  onAuthorChange,
  onTextChange,
  onSubmit,
}: CommentFormProps) {
  return (
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
      />
      <button className="commentAdd" type="submit">
        Add
      </button>
    </form>
  )
}

