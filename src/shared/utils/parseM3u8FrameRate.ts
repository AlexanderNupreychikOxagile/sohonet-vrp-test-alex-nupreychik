export function parseM3u8FrameRate(text: string): number | null {
  let max = 0
  for (const m of text.matchAll(/FRAME-RATE=([0-9]+(?:\.[0-9]+)?)/g)) {
    const n = Number(m[1])
    if (Number.isFinite(n) && n > 0) max = Math.max(max, n)
  }
  return max > 0 ? max : null
}

