import { describe, it, expect } from 'vitest'
import { formatTimecode } from './formatTimecode'

describe('formatTimecode', () => {
  it('formats time with ms', () => {
    expect(formatTimecode(0)).toBe('00:00:00.000')
    expect(formatTimecode(12.324)).toBe('00:00:12.324')
    expect(formatTimecode(60)).toBe('00:01:00.000')
    expect(formatTimecode(3661.2)).toBe('01:01:01.200')
  })
})

