import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { halfYears, lessons, subjects, topics } from '../data/mockData'

function FolderIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UnterrichtScreen() {
  const navigate = useNavigate()
  const currentHJ = halfYears.find((h) => h.isCurrent)!
  const [selectedHJId, setSelectedHJId] = useState(currentHJ.id)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(['geschichte', 'mathematik'])
  )

  const filteredTopics = topics.filter((t) => t.halfYearId === selectedHJId)

  const subjectGroups = subjects
    .map((s) => ({ subject: s, topics: filteredTopics.filter((t) => t.subjectId === s.id) }))
    .filter((g) => g.topics.length > 0)

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-14 pb-2">
        <h1 className="text-2xl font-bold text-text-primary">Unterricht</h1>
        <p className="text-text-muted text-sm mt-1">Smart Folder · Bayern</p>
      </div>

      {/* Record button */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate('/unterricht/geschichte')}
          className="w-full bg-accent text-white rounded-card py-4 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-accent/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
            <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
          </svg>
          Neue Stunde aufnehmen
        </button>
      </div>

      {/* Halbjahr selector */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {halfYears.map((hj) => (
            <button
              key={hj.id}
              onClick={() => setSelectedHJId(hj.id)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-card text-sm font-medium transition-all duration-150 border ${
                selectedHJId === hj.id
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <span>{hj.name}</span>
              <span className={`text-xs mt-0.5 ${selectedHJId === hj.id ? 'text-white/70' : 'text-text-muted'}`}>
                {hj.period}
                {hj.isCurrent && ' ●'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Folder tree */}
      <div className="px-4 space-y-3">
        {subjectGroups.map(({ subject, topics: subjectTopics }) => {
          const isExpanded = expandedSubjects.has(subject.id)
          const coveredCount = subjectTopics.filter((t) => t.lessonIds.length > 0).length

          return (
            <div key={subject.id} className="bg-surface border border-border rounded-card overflow-hidden">
              {/* Subject folder header */}
              <button
                onClick={() => toggleSubject(subject.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-hover transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-btn flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${subject.color}22` }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-text-primary font-semibold text-sm">{subject.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {coveredCount} / {subjectTopics.length} Themen abgedeckt
                  </p>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-text-muted transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Topic folders */}
              {isExpanded && (
                <div className="border-t border-border">
                  {subjectTopics.map((topic, i) => {
                    const hasLessons = topic.lessonIds.length > 0
                    const lastLessonId = topic.lessonIds[topic.lessonIds.length - 1]
                    const lastLesson = lastLessonId ? lessons.find((l) => l.id === lastLessonId) : null
                    const isLast = i === subjectTopics.length - 1

                    return (
                      <button
                        key={topic.id}
                        onClick={() => hasLessons && navigate(`/unterricht/${topic.subjectId}`)}
                        className={`w-full flex items-center gap-3 pl-5 pr-4 py-3 text-left transition-colors
                          ${!isLast ? 'border-b border-border' : ''}
                          ${hasLessons ? 'hover:bg-surface-hover cursor-pointer' : 'cursor-default opacity-50'}
                        `}
                      >
                        {/* Indent line */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-px h-5 bg-border" />
                          <FolderIcon
                            color={hasLessons ? subject.color : '#4A4A60'}
                            size={18}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${hasLessons ? 'text-text-primary' : 'text-text-muted'}`}>
                            {topic.name}
                          </p>
                          {lastLesson ? (
                            <p className="text-text-muted text-xs mt-0.5">
                              Zuletzt {new Date(lastLesson.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                            </p>
                          ) : (
                            <p className="text-text-muted text-xs mt-0.5">Noch keine Aufnahme</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {topic.kcAligned && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-accent-soft text-accent font-semibold">
                              KC
                            </span>
                          )}
                          <span className={`text-xs font-medium min-w-[16px] text-right ${hasLessons ? 'text-text-secondary' : 'text-text-muted'}`}>
                            {topic.lessonIds.length}
                          </span>
                          {hasLessons && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {/* Add topic row */}
                  <button className="w-full flex items-center gap-3 pl-5 pr-4 py-2.5 text-left hover:bg-surface-hover transition-colors opacity-50 hover:opacity-70">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-px h-4 bg-border" />
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A4A60" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-text-muted text-xs">Thema hinzufügen</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
