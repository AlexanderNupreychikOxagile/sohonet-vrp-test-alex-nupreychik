import { describe, it, expect } from 'vitest'
import { parseM3u8FrameRate } from './parseM3u8FrameRate'

describe('parseM3u8FrameRate', () => {
  it('returns null if missing', () => {
    expect(parseM3u8FrameRate('#EXTM3U\n')).toBeNull()
  })

  it('returns max FRAME-RATE', () => {
    const text = [
      '#EXTM3U',
      '#EXT-X-STREAM-INF:BANDWIDTH=1000,FRAME-RATE=24.0',
      'a.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=2000,FRAME-RATE=30',
      'b.m3u8',
    ].join('\n')
    expect(parseM3u8FrameRate(text)).toBe(30)
  })
})

