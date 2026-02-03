function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function pad3(n: number) {
  return String(n).padStart(3, '0')
}

export function formatTimecode(timeSeconds: number) {
  if (!Number.isFinite(timeSeconds) || timeSeconds <= 0) return '00:00:00.000'

  const totalMs = Math.round(timeSeconds * 1000)
  const ms = totalMs % 1000
  const totalSeconds = Math.floor(totalMs / 1000)

  const s = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const m = totalMinutes % 60
  const h = Math.floor(totalMinutes / 60)

  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`
}

