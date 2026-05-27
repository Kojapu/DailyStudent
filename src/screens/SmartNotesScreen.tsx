import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FotoScannerWidget } from '../components/lesson/FotoScannerWidget'
import { Header } from '../components/ui/Header'
import { ProModal } from '../components/ui/ProModal'
import { lessons, smartNotes, subjects } from '../data/mockData'

const IS_PRO = false

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors"
      >
        <span className="text-text-primary font-semibold text-sm">{title}</span>
        <div className="flex items-center gap-2">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-text-muted"
          >
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
  const [proOpen, setProOpen] = useState(false)

  const subject = subjects.find((s) => s.id === id)
  const lesson = lessons.find((l) => l.id === lessonId)
  const note = smartNotes.find((n) => n.lessonId === lessonId) ?? smartNotes[0]

  if (!lesson || !subject) return <div className="p-4 text-text-secondary">Stunde nicht gefunden.</div>

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <Header title="Smart Notes" subtitle={lesson.topic} showBack />

      {/* Foto scanner */}
      <div className="mx-4 bg-surface border border-border rounded-card mb-4">
        <FotoScannerWidget />
      </div>

      <div className="px-4 space-y-3">
        {/* KI-Zusammenfassung — locked for free users */}
        <CollapsibleSection title="📝 KI-Zusammenfassung">
          {IS_PRO ? (
            <p className="text-text-secondary text-sm leading-relaxed">{note.summary}</p>
          ) : (
            <div className="relative">
              <div className="filter blur-sm pointer-events-none select-none">
                <p className="text-text-secondary text-sm leading-relaxed">{note.summary}</p>
              </div>
              <button
                className="absolute inset-0 flex items-center justify-center w-full"
                onClick={() => setProOpen(true)}
              >
                <div className="flex items-center gap-2 bg-surface border border-border rounded-card px-4 py-2.5 shadow-lg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                  </svg>
                  <span className="text-accent text-sm font-semibold">Pro freischalten</span>
                </div>
              </button>
            </div>
          )}
        </CollapsibleSection>

        {/* Schlüsselbegriffe */}
        <CollapsibleSection title="🔑 Schlüsselbegriffe">
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
        </CollapsibleSection>

        {/* Mögliche Klausurthemen */}
        <CollapsibleSection title="🎯 Mögliche Klausurthemen">
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
        </CollapsibleSection>
      </div>

      <ProModal feature="ki-zusammenfassung" isOpen={proOpen} onClose={() => setProOpen(false)} />
    </div>
  )
}
