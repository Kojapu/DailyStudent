import { useNavigate } from 'react-router-dom'
import { Header } from '../components/ui/Header'
import { subjects } from '../data/mockData'

export function SubjectListScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <Header title="Meine Fächer" subtitle={`${subjects.length} Fächer`} />

      <div className="px-4 grid grid-cols-2 gap-3 mt-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => navigate(`/faecher/${subject.id}`)}
            className="bg-surface border border-border rounded-card p-4 text-left hover:bg-surface-hover active:scale-95 transition-all duration-150 flex flex-col gap-3"
          >
            <div
              className="w-12 h-12 rounded-btn flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${subject.color}22` }}
            >
              {subject.icon}
            </div>
            <div>
              <p className="text-text-primary font-semibold">{subject.name}</p>
              <p className="text-text-muted text-xs mt-0.5">{subject.lessonCount} Stunden</p>
            </div>
            {subject.nextExam && (
              <div
                className="text-xs px-2 py-1 rounded-pill self-start font-medium"
                style={{ backgroundColor: `${subject.color}22`, color: subject.color }}
              >
                Klausur: {new Date(subject.nextExam).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
              </div>
            )}
            {!subject.nextExam && (
              <div className="text-xs px-2 py-1 rounded-pill self-start font-medium bg-surface border border-border text-text-muted">
                Keine Klausur
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
