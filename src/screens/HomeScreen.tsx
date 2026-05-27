import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { lessons, subjects } from '../data/mockData'

export function HomeScreen() {
  const navigate = useNavigate()

  const todaySubjects = subjects.slice(0, 3)
  const recentLessons = lessons.slice(0, 2)

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Top header */}
      <div className="px-4 pt-14 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm">Dienstag, 27. Mai</p>
            <h1 className="text-2xl font-bold text-text-primary mt-0.5">Guten Morgen, Max 👋</h1>
          </div>
          <Badge color="warning" className="text-sm px-3 py-1.5">
            🔥 12 Tage
          </Badge>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 pt-4 pb-2 flex gap-3">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => navigate('/faecher/geschichte/l1')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          Stunde aufnehmen
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate('/lernen')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Lernen starten
        </Button>
      </div>

      <div className="px-4 space-y-6 mt-4">
        {/* Heute */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Heute</h2>
          <div className="space-y-2">
            {todaySubjects.map((subject) => (
              <Card
                key={subject.id}
                hoverable
                onClick={() => navigate(`/faecher/${subject.id}`)}
                className="flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-btn flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${subject.color}22` }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium">{subject.name}</p>
                  {subject.nextExam && (
                    <p className="text-text-muted text-xs mt-0.5">
                      Klausur: {new Date(subject.nextExam).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                    </p>
                  )}
                </div>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
              </Card>
            ))}
          </div>
        </section>

        {/* Letzte Aktivität */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Letzte Aktivität</h2>
          <div className="space-y-2">
            {recentLessons.map((lesson) => {
              const subject = subjects.find((s) => s.id === lesson.subjectId)
              return (
                <Card
                  key={lesson.id}
                  hoverable
                  onClick={() => navigate(`/faecher/${lesson.subjectId}/${lesson.id}`)}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-btn flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${subject?.color}22` }}
                  >
                    {subject?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-text-primary font-medium text-sm truncate">{lesson.topic}</p>
                      {lesson.hasNotes && <Badge color="accent" className="shrink-0">Smart Notes</Badge>}
                    </div>
                    <p className="text-text-muted text-xs mt-1">
                      {subject?.name} · {new Date(lesson.date).toLocaleDateString('de-DE')} · {lesson.duration} Min
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
