import { useState } from 'react'
import './App.css'
import { VideoPlayer } from './components/VideoPlayer'

const DEFAULT_SRC =
  'https://storage.googleapis.com/sohonet-interview-video-sample-public/1040056094289814902/manifests/master_stage_3.m3u8'

function App() {
  const [value, setValue] = useState(DEFAULT_SRC)
  const [src, setSrc] = useState(DEFAULT_SRC)

  return (
    <div className="shell">
      <form
        className="source"
        onSubmit={(e) => {
          e.preventDefault()
          const next = value.trim()
          if (!next) return
          setSrc(next)
        }}
      >
        <input
          className="sourceInput"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste .m3u8 URL"
          aria-label="Video source URL"
        />
        <button className="sourceButton" type="submit">
          Load
        </button>
      </form>

      <VideoPlayer src={src} />
    </div>
  )
}

export default App
