import './App.css'
import { VideoPlayer } from './components/VideoPlayer'

function App() {
  const src =
    'https://storage.googleapis.com/sohonet-interview-video-sample-public/1040056094289814902/manifests/master_stage_3.m3u8'

  return <VideoPlayer src={src} />
}

export default App
