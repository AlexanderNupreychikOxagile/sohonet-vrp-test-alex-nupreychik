export type Comment = {
  id: string
  time: number
  author: string
  text: string
  resolved: boolean
}

export type NewCommentInput = {
  time: number
  author: string
  text: string
}

export function createComment(id: string, input: NewCommentInput): Comment {
  return { id, ...input, resolved: false }
}

export function addComment(comments: Comment[], input: NewCommentInput) {
  const id = `c_${comments.length + 1}`
  return [...comments, createComment(id, input)]
}

