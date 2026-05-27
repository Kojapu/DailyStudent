import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { extractTextFromImage, generateSmartNote } from '../lib/groq'
import { useUser } from '../context/UserContext'
import { subjects, halfYears } from '../data/mockData'
import type { GeneratedSmartNote, UserNote } from '../types'

type AiStatus = 'idle' | 'analyzing' | 'done' | 'error'

export function NoteCreateScreen() {
  const { id, folderId } = useParams<{ id?: string; folderId?: string }>()
  const navigate = useNavigate()
  const { profile, addUserNote, saveGeneratedNote, userFolders } = useUser()

  const [noteId] = useState(() => `note-${crypto.randomUUID()}`)

  const subjectFromUrl = id ? subjects.find((s) => s.id === id) : null
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(id ?? '')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string>(folderId ?? '')
  const subject = subjects.find((s) => s.id === selectedSubjectId) ?? null

  const [title, setTitle] = useState(subjectFromUrl ? `${subjectFromUrl.name}: ` : '')
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiError, setAiError] = useState('')
  const [generatedNote, setGeneratedNote] = useState<GeneratedSmartNote | null>(null)

  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const profileSubjects = (profile?.faecher ?? [])
    .map((sid) => subjects.find((s) => s.id === sid))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    setIsPdf(file.type === 'application/pdf')
    const reader = new FileReader()
    reader.onload = (e) => setAttachment(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    const subjectName = subject?.name ?? 'Allgemein'
    if (!attachment && !content.trim()) return

    setAiStatus('analyzing')
    setAiError('')

    try {
      let rawText = content.trim()

      if (attachment && !isPdf) {
        const ocrText = await extractTextFromImage(attachment)
        rawText = rawText ? `${rawText}\n\n${ocrText}` : ocrText
      }

      if (!rawText) throw new Error('Kein Text zum Analysieren gefunden.')

      const note = await generateSmartNote(rawText, subjectName, noteId)
      setGeneratedNote(note)
      setAiStatus('done')
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Unbekannter Fehler')
      setAiStatus('error')
    }
  }

  const confirmSave = (finalFolderId: string) => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const note: UserNote = {
      id: noteId,
      subjectId: selectedSubjectId || undefined,
      folderId: finalFolderId || undefined,
      title: trimmedTitle || 'Neue Notiz',
      content: trimmedContent,
      attachment: attachment ?? undefined,
      createdAt: new Date().toISOString(),
    }
    addUserNote(note)
    if (generatedNote) saveGeneratedNote(noteId, generatedNote)
    setShowSaveModal(false)
    if (finalFolderId && selectedSubjectId) navigate(`/unterricht/${selectedSubjectId}/ordner/${finalFolderId}`)
    else if (selectedSubjectId) navigate(`/unterricht/${selectedSubjectId}`)
    else navigate('/unterricht')
  }

  const handleSavePress = () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle && !trimmedContent && !attachment) { navigate(-1); return }
    // If coming from a specific folder, save directly without modal
    if (folderId) { confirmSave(folderId); return }
    // If no subject selected, save directly
    if (!selectedSubjectId) { confirmSave(''); return }
    // Otherwise show folder picker
    setShowSaveModal(true)
  }

  const canAnalyze = (!!attachment || content.trim().length > 10) && aiStatus !== 'analyzing'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors px-1 py-1"
        >
          Abbrechen
        </button>
        <div className="flex items-center gap-2">
          {subject && (
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-sm"
              style={{ backgroundColor: `${subject.color}22` }}
            >
              {subject.icon}
            </div>
          )}
          <span className="text-text-primary font-semibold text-sm">Neue Notiz</span>
        </div>
        <button
          onClick={handleSavePress}
          className="text-accent text-sm font-semibold hover:opacity-80 transition-opacity px-1 py-1"
        >
          Speichern
        </button>
      </div>

      {/* Subject picker — only when no subject in URL */}
      {!id && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Fach</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedSubjectId('')}
              className={`shrink-0 px-3 py-1.5 rounded-pill text-xs font-medium border transition-all ${
                selectedSubjectId === ''
                  ? 'bg-surface-hover border-border text-text-secondary'
                  : 'border-border text-text-muted hover:bg-surface-hover'
              }`}
            >
              Kein Fach
            </button>
            {profileSubjects.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSubjectId(s.id)
                  if (!title.trim() || title === `${subject?.name}: `) setTitle(`${s.name}: `)
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium border transition-all ${
                  selectedSubjectId === s.id ? 'text-white border-transparent' : 'border-border text-text-muted hover:bg-surface-hover'
                }`}
                style={selectedSubjectId === s.id ? { backgroundColor: s.color } : undefined}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel"
        autoFocus={!!id}
        className="w-full bg-transparent px-4 py-4 text-text-primary text-lg font-semibold placeholder-text-muted focus:outline-none border-b border-border"
      />

      {/* Content textarea — full document style */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Schreib deine Mitschrift, Stichpunkte, Formeln oder ganze Sätze — alles ist erlaubt…"
        className="w-full bg-transparent px-4 py-4 text-text-secondary text-sm placeholder-text-muted focus:outline-none resize-none leading-relaxed"
        style={{ minHeight: '220px' }}
      />

      {/* Attachment preview */}
      {attachment && !isPdf && (
        <div className="mx-4 mb-3 relative">
          <img src={attachment} alt="Anhang" className="w-full max-h-52 object-cover rounded-card border border-border" />
          <button
            onClick={() => setAttachment(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      {attachment && isPdf && (
        <div className="mx-4 mb-3 flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-text-secondary text-sm flex-1">PDF angehängt</span>
          <button onClick={() => setAttachment(null)} className="text-text-muted hover:text-danger transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* AI result */}
      {aiStatus === 'analyzing' && (
        <div className="mx-4 mb-3 px-4 py-4 bg-surface border border-border rounded-card flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="text-text-secondary text-sm">KI analysiert deine Notiz…</p>
        </div>
      )}
      {aiStatus === 'error' && (
        <div className="mx-4 mb-3 px-4 py-3 rounded-card" style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p className="text-sm" style={{ color: '#F87171' }}>{aiError}</p>
        </div>
      )}
      {aiStatus === 'done' && generatedNote && (
        <div className="mx-4 mb-3 space-y-2">
          <div className="flex items-center gap-2 px-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs text-accent font-semibold">KI-Analyse fertig — wird beim Speichern übernommen</span>
          </div>
          <div className="bg-surface border border-border rounded-card px-4 py-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Zusammenfassung</p>
            <p className="text-text-secondary text-sm leading-relaxed">{generatedNote.summary}</p>
          </div>
          {generatedNote.keywords.length > 0 && (
            <div className="bg-surface border border-border rounded-card px-4 py-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Schlüsselbegriffe</p>
              <div className="flex flex-wrap gap-1.5">
                {generatedNote.keywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 rounded-pill text-xs font-medium bg-surface-hover border border-border text-text-secondary">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {generatedNote.examTopics.length > 0 && (
            <div className="bg-surface border border-border rounded-card px-4 py-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Mögliche Klausurthemen</p>
              <ul className="space-y-1.5">
                {generatedNote.examTopics.map((t, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm text-text-secondary">
                    <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="sticky bottom-0 border-t border-border px-4 py-3 flex items-center gap-2 bg-surface">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-card border border-border bg-background hover:bg-surface-hover transition-colors text-sm text-text-secondary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Foto
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-card border border-border bg-background hover:bg-surface-hover transition-colors text-sm text-text-secondary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
          </svg>
          Hochladen
        </button>
        <button
          onClick={() => void analyze()}
          disabled={!canAnalyze}
          className={`ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-card text-sm font-semibold transition-all duration-150 ${
            canAnalyze
              ? 'bg-accent text-white hover:opacity-90 active:scale-95'
              : 'bg-surface-hover text-text-muted cursor-not-allowed'
          }`}
        >
          {aiStatus === 'analyzing' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Analysiert…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              KI analysieren
            </>
          )}
        </button>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />

      {/* Save destination modal */}
      {showSaveModal && (() => {
        const subjectFolders = userFolders.filter((f) => f.subjectId === selectedSubjectId)
        const grouped = halfYears
          .map((hy) => ({ halfYear: hy, folders: subjectFolders.filter((f) => f.halfYearId === hy.id) }))
          .filter((g) => g.folders.length > 0)
        const ungrouped = subjectFolders.filter((f) => !f.halfYearId)
        return (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowSaveModal(false)} />
            <div className="relative max-w-lg mx-auto w-full bg-surface border-t border-border rounded-t-2xl z-10 max-h-[80vh] flex flex-col">
              <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                <h2 className="text-base font-bold text-text-primary">Wo speichern?</h2>
                <p className="text-text-muted text-xs mt-0.5">
                  {subject ? `${subject.icon} ${subject.name}` : 'Kein Fach'}
                </p>
              </div>
              <div className="overflow-y-auto flex-1">
                {/* No folder option */}
                <button
                  onClick={() => { setSelectedFolderId(''); confirmSave('') }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-hover transition-colors border-b border-border ${selectedFolderId === '' ? 'bg-accent/5' : ''}`}
                >
                  <div className="w-8 h-8 rounded-btn bg-surface-hover flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Direkt im Fach</p>
                    <p className="text-text-muted text-xs">Ohne Unterordner speichern</p>
                  </div>
                </button>

                {/* Grouped folders */}
                {grouped.map(({ halfYear, folders }) => (
                  <div key={halfYear.id}>
                    <div className="px-5 py-2 bg-background/40">
                      <span className="text-xs font-semibold text-text-muted">{halfYear.name}</span>
                      {halfYear.isCurrent && <span className="ml-2 text-xs text-accent font-medium">Aktuell</span>}
                    </div>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => { setSelectedFolderId(folder.id); confirmSave(folder.id) }}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-hover transition-colors border-b border-border ${selectedFolderId === folder.id ? 'bg-accent/5' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-btn flex items-center justify-center shrink-0" style={{ backgroundColor: `${subject?.color ?? '#7C6FFF'}22` }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={subject?.color ?? '#7C6FFF'} strokeWidth="1.8">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-text-primary flex-1 truncate">{folder.name}</p>
                        {selectedFolderId === folder.id && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Ungrouped folders */}
                {ungrouped.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => { setSelectedFolderId(folder.id); confirmSave(folder.id) }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-hover transition-colors border-b border-border"
                  >
                    <div className="w-8 h-8 rounded-btn flex items-center justify-center shrink-0" style={{ backgroundColor: `${subject?.color ?? '#7C6FFF'}22` }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={subject?.color ?? '#7C6FFF'} strokeWidth="1.8">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-text-primary flex-1 truncate">{folder.name}</p>
                  </button>
                ))}

                {subjectFolders.length === 0 && (
                  <div className="px-5 py-6 text-center text-text-muted text-sm">
                    Noch keine Ordner für dieses Fach.
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
