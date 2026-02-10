import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import styles from './VideoPlayer.module.css'
import { setupVrpReviewControls } from './videojsControls'
import { parseM3u8FrameRate } from '../../shared/utils/parseM3u8FrameRate'
import { isHttpUrl } from '../../shared/utils/isHttpUrl'

export type VideoPlayerHandle = {
  getTime: () => number
  seek: (time: number) => void
  isPaused: () => boolean
  pause: () => void
  togglePlayPause: () => void
}

type VideoPlayerProps = {
  src: string
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ src }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null)
  const playerElRef = useRef<HTMLElement | null>(null)
  const frameStepRef = useRef(1 / 30)
  const lastMediaTimeRef = useRef<number | null>(null)
  const measuredFrameStepRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || playerRef.current) return

    const options = {
      controls: true,
      preload: 'auto',
      fluid: true,
      playsinline: true,
    }

    const el = document.createElement('video-js')
    el.className = 'video-js vjs-big-play-centered'
    container.appendChild(el)
    playerElRef.current = el

    const player = videojs(el, options)
    playerRef.current = player

    const stepFrame = (dir: -1 | 1) => {
      if (!player.paused()) return
      const step = frameStepRef.current || 1 / 30
      const next = Math.max(0, (player.currentTime() || 0) + dir * step)
      player.currentTime(next)
      player.pause()
    }

    const seekBy = (deltaSeconds: number) => {
      const next = Math.max(0, (player.currentTime() || 0) + deltaSeconds)
      player.currentTime(next)
    }

    let teardownControls: (() => void) | null = null
    player.ready(() => {
      teardownControls = setupVrpReviewControls(player, { stepFrame, seekBy })
    })

    const techVideo = player.el()?.querySelector('video')
    techVideo?.setAttribute('playsinline', '')
    techVideo?.setAttribute('webkit-playsinline', '')
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
          if (dt > 0 && dt < 0.2) {
            frameStepRef.current = dt
            measuredFrameStepRef.current = true
          }
        }
        videoFrameCallbackId = v.requestVideoFrameCallback(onVideoFrame)
      }

      videoFrameCallbackId = v.requestVideoFrameCallback(onVideoFrame)
      cancelVideoFrameCallback = () =>
        v.cancelVideoFrameCallback?.(videoFrameCallbackId)
    }

    return () => {
      if (videoFrameCallbackId) cancelVideoFrameCallback?.()
      teardownControls?.()
      playerRef.current?.dispose()
      playerRef.current = null
      playerElRef.current?.remove()
      playerElRef.current = null
    }
  }, [])

  useEffect(() => {
    playerRef.current?.src({ src, type: 'application/x-mpegURL' })

    measuredFrameStepRef.current = false
    lastMediaTimeRef.current = null
    frameStepRef.current = 1 / 30

    if (typeof fetch !== 'function') return
    if (!isHttpUrl(src)) return
    const ac = new AbortController()

    const run = async () => {
      try {
        const res = await fetch(src, { signal: ac.signal })
        if (!res.ok) return
        const fps = parseM3u8FrameRate(await res.text())
        if (!fps) return
        if (measuredFrameStepRef.current) return
        frameStepRef.current = 1 / fps
      } catch {
        return
      }
    }

    void run()
    return () => ac.abort()
  }, [src])

  useImperativeHandle(
    ref,
    () => ({
      getTime: () => playerRef.current?.currentTime() || 0,
      seek: (time) => {
        playerRef.current?.currentTime(time)
      },
      isPaused: () => !!playerRef.current?.paused(),
      pause: () => {
        playerRef.current?.pause()
      },
      togglePlayPause: () => {
        const player = playerRef.current
        if (!player) return
        if (player.paused()) void player.play()
        else player.pause()
      },
    }),
    [],
  )

  return (
    <div className={styles.video} data-testid="video-player">
      <div className={styles.stage} ref={containerRef} />
    </div>
  )
  },
)

