import { useState } from 'react'

// TODO: connect to Web Audio API + Whisper (on-device) for real transcription

export function AudioRecorderWidget() {
  const [recording, setRecording] = useState(false)

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        onClick={() => setRecording((r) => !r)}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
          recording
            ? 'bg-danger shadow-lg shadow-danger/40 scale-110 animate-pulse'
            : 'bg-surface border-2 border-border hover:border-accent'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={recording ? 'text-white' : 'text-text-secondary'}>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        {recording && <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />}
        <span className={`text-sm font-medium ${recording ? 'text-danger' : 'text-text-secondary'}`}>
          {recording ? 'Aufnahme läuft...' : 'Bereit'}
        </span>
      </div>
      <p className="text-xs text-text-muted">
        {recording ? 'Tippen zum Stoppen' : 'Stunde aufnehmen'}
      </p>
    </div>
  )
}
