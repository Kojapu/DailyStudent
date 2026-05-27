import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FotoScannerWidget } from '../components/lesson/FotoScannerWidget'
import { Header } from '../components/ui/Header'
import { useUser } from '../context/UserContext'
import { lessons, smartNotes, subjects } from '../data/mockData'
import type { GeneratedSmartNote } from '../types'

function CollapsibleSection({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-semibold text-sm">{title}</span>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-text-muted transition-transform ${open ? '' : '-rotate-90'}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export function SmartNotesScreen() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const { generatedNotes, saveGeneratedNote, userNotes } = useUser()

  const subject = subjects.find((s) => s.id === id)
  const mockLesson = lessons.find((l) => l.id === lessonId)
  const userNote = userNotes.find((n) => n.id === lessonId)

  const lessonTitle = mockLesson?.topic ?? userNote?.title ?? 'Notiz'
  const generatedNote: GeneratedSmartNote | undefined = generatedNotes[lessonId ?? '']

  // For mock lessons keep mock content; for user notes only show real AI content
  const mockNote = mockLesson ? (smartNotes.find((n) => n.lessonId === lessonId) ?? smartNotes[0]) : null
  const note = {
    summary: generatedNote?.summary ?? mockNote?.summary ?? null,
    keywords: generatedNote?.keywords ?? mockNote?.keywords ?? [],
    examTopics: generatedNote?.examTopics ?? mockNote?.examTopics ?? [],
  }
  const isGenerated = !!generatedNote

  const handleNoteGenerated = (newNote: GeneratedSmartNote) => {
    if (lessonId) saveGeneratedNote(lessonId, newNote)
  }

  if (!subject || (!mockLesson && !userNote)) return <div className="p-4 text-text-secondary">Notiz nicht gefunden.</div>

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <Header title="Smart Notes" subtitle={lessonTitle} showBack />

      {/* Foto scanner */}
      <div className="mx-4 bg-surface border border-border rounded-card mb-4">
        <FotoScannerWidget
          lessonId={lessonId}
          subjectName={subject.name}
          onNoteGenerated={handleNoteGenerated}
        />
      </div>

      <div className="px-4 space-y-3">
        {/* Eigene Mitschrift — nur bei User-Notizen mit Inhalt */}
        {userNote?.content && (
          <CollapsibleSection title="✏️ Meine Mitschrift">
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{userNote.content}</p>
          </CollapsibleSection>
        )}

        {/* KI-Zusammenfassung */}
        <CollapsibleSection
          title="📝 KI-Zusammenfassung"
          badge={isGenerated ? (
            <span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">KI</span>
          ) : undefined}
        >
          {note.summary ? (
            <p className="text-text-secondary text-sm leading-relaxed">{note.summary}</p>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-btn bg-accent-soft flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="text-text-muted text-sm">Scanne ein Foto des Tafelbilds um die KI-Analyse zu starten.</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Schlüsselbegriffe */}
        <CollapsibleSection title="🔑 Schlüsselbegriffe">
          {note.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {note.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-pill text-xs font-medium bg-surface-hover border border-border text-text-secondary"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Werden nach dem KI-Scan generiert.</p>
          )}
        </CollapsibleSection>

        {/* Mögliche Klausurthemen */}
        <CollapsibleSection title="🎯 Mögliche Klausurthemen">
          {note.examTopics.length > 0 ? (
            <ul className="space-y-2">
              {note.examTopics.map((topic, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="w-5 h-5 rounded-pill text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${subject.color}22`, color: subject.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-text-secondary text-sm">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-sm">Werden nach dem KI-Scan generiert.</p>
          )}
        </CollapsibleSection>
      </div>

    </div>
  )
}
