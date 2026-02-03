import { useEffect, useMemo, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './VideoPlayer.css'
import { formatTimecode } from '../utils/formatTimecode'

type VideoPlayerProps = {
  src: string
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null)
  const playerElRef = useRef<HTMLElement | null>(null)
  const frameStepRef = useRef(1 / 30)
  const lastMediaTimeRef = useRef<number | null>(null)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container || playerRef.current) return

    const options = {
      controls: true,
      preload: 'auto',
      fluid: true,
    }

    const el = document.createElement('video-js')
    el.className = 'video-js vjs-big-play-centered'
    container.appendChild(el)
    playerElRef.current = el

    const player = videojs(el, options)
    playerRef.current = player

    const sync = () => {
      setCurrentTime(player.currentTime() || 0)
      setDuration(player.duration() || 0)
      setPaused(player.paused())
    }

    const onTime = () => setCurrentTime(player.currentTime() || 0)
    const onDuration = () => setDuration(player.duration() || 0)
    const onPause = () => setPaused(true)
    const onPlay = () => setPaused(false)

    player.on('timeupdate', onTime)
    player.on('durationchange', onDuration)
    player.on('pause', onPause)
    player.on('play', onPlay)
    sync()

    const techVideo = player.el()?.querySelector('video')
    let videoFrameCallbackId = 0
    let cancelVideoFrameCallback: (() => void) | null = null

    if (techVideo && 'requestVideoFrameCallback' in techVideo) {
      const v = techVideo as HTMLVideoElement & {
        requestVideoFrameCallback: (
          cb: (now: number, meta: { mediaTime: number }) => void,
        ) => number
        cancelVideoFrameCallback?: (id: number) => void
      }

      const onVideoFrame = (_now: number, meta: { mediaTime: number }) => {
        const last = lastMediaTimeRef.current
        lastMediaTimeRef.current = meta.mediaTime
        if (last != null) {
          const dt = meta.mediaTime - last
          if (dt > 0 && dt < 0.2) frameStepRef.current = dt
        }
        videoFrameCallbackId = v.requestVideoFrameCallback(onVideoFrame)
      }

      videoFrameCallbackId = v.requestVideoFrameCallback(onVideoFrame)
      cancelVideoFrameCallback = () =>
        v.cancelVideoFrameCallback?.(videoFrameCallbackId)
    }

    return () => {
      if (videoFrameCallbackId) cancelVideoFrameCallback?.()
      player.off('timeupdate', onTime)
      player.off('durationchange', onDuration)
      player.off('pause', onPause)
      player.off('play', onPlay)
      playerRef.current?.dispose()
      playerRef.current = null
      playerElRef.current?.remove()
      playerElRef.current = null
    }
  }, [])

  useEffect(() => {
    playerRef.current?.src({ src, type: 'application/x-mpegURL' })
  }, [src])

  const timeLabel = useMemo(() => {
    return `${formatTimecode(currentTime)} / ${formatTimecode(duration)}`
  }, [currentTime, duration])

  const stepFrame = (dir: -1 | 1) => {
    const player = playerRef.current
    if (!player || !player.paused()) return

    const step = frameStepRef.current || 1 / 30
    const next = Math.max(0, (player.currentTime() || 0) + dir * step)
    player.currentTime(next)
    player.pause()
  }

  return (
    <div className="vrp-video" data-testid="video-player">
      <div className="vrp-top">
        <div className="vrp-time" aria-label="Timecode">
          {timeLabel}
        </div>
        <div className="vrp-frames">
          <button
            className="vrp-frameButton"
            type="button"
            onClick={() => stepFrame(-1)}
            disabled={!paused}
          >
            −1f
          </button>
          <button
            className="vrp-frameButton"
            type="button"
            onClick={() => stepFrame(1)}
            disabled={!paused}
          >
            +1f
          </button>
        </div>
      </div>
      <div ref={containerRef} />
    </div>
  )
}

