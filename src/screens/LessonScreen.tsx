import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Header } from '../components/ui/Header'
import { lessons, subjects } from '../data/mockData'

export function LessonScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const subject = subjects.find((s) => s.id === id)
  const subjectLessons = lessons.filter((l) => l.subjectId === id)

  if (!subject) return <div className="p-4 text-text-secondary">Fach nicht gefunden.</div>

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <Header
        title={subject.name}
        subtitle={`${subjectLessons.length} Stunden`}
        showBack
        right={
          <div
            className="w-10 h-10 rounded-btn flex items-center justify-center text-xl"
            style={{ backgroundColor: `${subject.color}22` }}
          >
            {subject.icon}
          </div>
        }
      />

      <div className="px-4 space-y-2 mt-2">
        {subjectLessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => navigate(`/unterricht/${id}/${lesson.id}`)}
            className="w-full bg-surface border border-border rounded-card p-4 text-left hover:bg-surface-hover active:scale-95 transition-all duration-150 flex items-start gap-4"
          >
            <div className="flex flex-col items-center gap-1 shrink-0 text-center min-w-[40px]">
              <span className="text-xs text-text-muted">
                {new Date(lesson.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
              </span>
              <div
                className="w-2 h-2 rounded-full mt-1"
                style={{ backgroundColor: lesson.hasNotes ? subject.color : '#2A2A2F' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-text-primary font-medium text-sm">{lesson.topic}</p>
                {lesson.hasNotes && <Badge color="accent">Smart Notes</Badge>}
              </div>
              <p className="text-text-muted text-xs mt-1">{lesson.duration} Minuten</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0 mt-1">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate(`/unterricht/${id}/neue-stunde`)}
        className="fixed bottom-24 right-4 bg-accent text-white rounded-pill px-5 py-3 font-semibold text-sm shadow-lg shadow-accent/30 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Neue Stunde aufnehmen
      </button>
    </div>
  )
}
