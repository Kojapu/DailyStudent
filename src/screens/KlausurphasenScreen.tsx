import { useNavigate } from 'react-router-dom'
import { examQuestions, flashCards, subjects } from '../data/mockData'

function daysUntil(dateStr: string) {
  const exam = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function KlausurphasenScreen() {
  const navigate = useNavigate()

  const upcomingExams = subjects
    .filter((s) => s.nextExam !== null)
    .map((s) => ({
      ...s,
      days: daysUntil(s.nextExam!),
      cardCount: flashCards.filter((f) => f.subjectId === s.id).length,
      questionCount: examQuestions.filter((q) => q.subjectId === s.id).length,
    }))
    .filter((s) => s.days >= 0)
    .sort((a, b) => a.days - b.days)

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-text-primary">Klausurphase</h1>
        <p className="text-text-muted text-sm mt-1">Vorbereitung & Mock-Klausuren</p>
      </div>

      {/* KI-Lernplan — Pro teaser */}
      <div className="mx-4 mb-5 relative overflow-hidden bg-accent-soft border border-accent/20 rounded-card p-4">
        <div className="filter blur-sm pointer-events-none select-none">
          <p className="text-accent font-semibold text-sm mb-1">KI-Lernplan — Geschichte</p>
          <p className="text-text-secondary text-xs mb-2">
            {upcomingExams[0]?.days ?? 0} Tage · 3 Einheiten geplant · Ziel: Note 1
          </p>
          <div className="h-1.5 bg-accent/20 rounded-pill overflow-hidden">
            <div className="h-full bg-accent rounded-pill" style={{ width: '40%' }} />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-card px-4 py-2 shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C6FFF" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
            </svg>
            <span className="text-accent text-xs font-semibold">KI-Lernplan · Pro</span>
          </div>
        </div>
      </div>

      {/* Exam list */}
      <div className="px-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Klausuren</h2>
        {upcomingExams.map((subject) => (
          <div key={subject.id} className="bg-surface border border-border rounded-card overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-btn flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${subject.color}22` }}
              >
                {subject.icon}
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-semibold text-sm">{subject.name}</p>
                <p className="text-text-muted text-xs mt-0.5">
                  {new Date(subject.nextExam!).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-btn text-xs font-bold shrink-0"
                style={{ backgroundColor: `${subject.color}22`, color: subject.color }}
              >
                {subject.days === 0 ? 'Heute' : `${subject.days}d`}
              </div>
            </div>

            {/* Progress */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                <span>
                  {subject.cardCount > 0 ? `${subject.cardCount} Karten` : 'Keine Karten'}
                  {subject.questionCount > 0 ? ` · ${subject.questionCount} Aufgaben` : ''}
                </span>
                <span>0 % gelernt</span>
              </div>
              <div className="h-1.5 bg-border rounded-pill overflow-hidden">
                <div className="h-full bg-accent rounded-pill" style={{ width: '0%' }} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex border-t border-border">
              <button
                onClick={() => navigate('/klausurmodus/lernen')}
                disabled={subject.cardCount === 0}
                className="flex-1 py-3 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Karteikarten
              </button>
              <div className="w-px bg-border" />
              <button
                onClick={() => navigate('/klausurmodus/klausur')}
                disabled={subject.questionCount === 0}
                className="flex-1 py-3 text-sm font-medium text-accent hover:bg-accent-soft transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" />
                </svg>
                Mock-Klausur
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
