import { describe, it, expect } from 'vitest'
import { addComment, createComment } from './comment'

describe('comments', () => {
  it('creates and adds comments with expected shape', () => {
    const c = createComment('c_1', {
      time: 12.324,
      author: 'Alice',
      text: 'Colour in background looks warm',
    })

    expect(c).toEqual({
      id: 'c_1',
      time: 12.324,
      author: 'Alice',
      text: 'Colour in background looks warm',
      resolved: false,
    })

    const list1 = addComment([], { time: 1, author: 'A', text: 't1' })
    const list2 = addComment(list1, { time: 2, author: 'B', text: 't2' })

    expect(list1).toEqual([{ id: 'c_1', time: 1, author: 'A', text: 't1', resolved: false }])
    expect(list2).toEqual([
      { id: 'c_1', time: 1, author: 'A', text: 't1', resolved: false },
      { id: 'c_2', time: 2, author: 'B', text: 't2', resolved: false },
    ])
  })
})

