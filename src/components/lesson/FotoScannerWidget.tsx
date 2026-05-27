import { useRef, useState } from 'react'

type ScanStatus = 'idle' | 'selected' | 'analyzing'

export function FotoScannerWidget() {
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setStatus('selected')
    }
    reader.readAsDataURL(file)
  }

  const reset = () => {
    setStatus('idle')
    setPreview(null)
    if (cameraRef.current) cameraRef.current.value = ''
    if (fileRef.current) fileRef.current.value = ''
  }

  const analyze = () => {
    setStatus('analyzing')
    // TODO: send preview to Qwen2-VL → Llama 3.3 pipeline
  }

  return (
    <div className="p-4">
      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {status === 'idle' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-text-primary text-sm font-semibold">Foto hinzufügen</span>
            <span className="text-xs text-text-muted ml-auto">KI analysiert automatisch</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-card border border-border bg-background hover:bg-surface-hover transition-colors text-sm text-text-secondary font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Foto aufnehmen
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-card border border-border bg-background hover:bg-surface-hover transition-colors text-sm text-text-secondary font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
              </svg>
              Datei auswählen
            </button>
          </div>
        </div>
      )}

      {status === 'selected' && preview && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-success text-sm font-semibold">Scan bereit</span>
            <button onClick={reset} className="ml-auto text-xs text-text-muted hover:text-text-secondary transition-colors">
              Neu aufnehmen
            </button>
          </div>
          <div className="flex gap-3 items-start">
            <img
              src={preview}
              alt="Scan preview"
              className="w-20 h-20 object-cover rounded-card border border-border shrink-0"
            />
            <div className="flex-1">
              <p className="text-text-secondary text-xs mb-3 leading-relaxed">
                Die KI erkennt Tafelbild, Text und Formeln und ergänzt diese Notiz automatisch.
              </p>
              <button
                onClick={analyze}
                className="w-full py-2.5 rounded-card bg-accent text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                KI-Analyse starten
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-btn bg-accent-soft flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2" className="animate-spin">
              <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-text-primary text-sm font-semibold">Analysiere Foto…</p>
            <p className="text-text-muted text-xs mt-0.5">Qwen2-VL erkennt Text und Formeln</p>
          </div>
        </div>
      )}
    </div>
  )
}
