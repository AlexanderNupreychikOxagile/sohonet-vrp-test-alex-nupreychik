import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './VideoPlayer.css'

type VideoPlayerProps = {
  src: string
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null)
  const playerElRef = useRef<HTMLElement | null>(null)

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

    playerRef.current = videojs(el, options)

    return () => {
      playerRef.current?.dispose()
      playerRef.current = null
      playerElRef.current?.remove()
      playerElRef.current = null
    }
  }, [])

  useEffect(() => {
    playerRef.current?.src({ src, type: 'application/x-mpegURL' })
  }, [src])

  return (
    <div className="vrp-video" data-testid="video-player" ref={containerRef} />
  )
}

