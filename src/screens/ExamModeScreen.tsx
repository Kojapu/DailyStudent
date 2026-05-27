import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExamQuestion } from '../components/learn/ExamQuestion'
import { Button } from '../components/ui/Button'
import { examQuestions } from '../data/mockData'

export function ExamModeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const total = examQuestions.length
  const current = examQuestions[currentIndex]
  const isLast = currentIndex === total - 1

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Exam header — minimal, no BottomNav */}
      <div className="px-4 pt-12 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-muted text-sm">Geschichte · Weimarer Republik</span>
          {/* Visual timer only */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-btn px-3 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span className="text-text-primary text-sm font-mono font-medium">45:00</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-border rounded-pill h-1.5 overflow-hidden">
            <div
              className="h-full bg-accent rounded-pill transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
          <span className="text-text-muted text-xs shrink-0">
            Aufgabe {currentIndex + 1} von {total}
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-5">
        <ExamQuestion
          text={current.text}
          points={current.points}
          operator={current.operator}
        />

        <textarea
          value={answers[current.id] ?? ''}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Schreibe deine Antwort hier..."
          className="w-full h-56 bg-surface border border-border rounded-card p-4 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="px-4 pb-8 flex gap-3">
        {!isLast ? (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setCurrentIndex((i) => i + 1)}>
              Weiter
            </Button>
            <Button variant="ghost" onClick={() => navigate('/klausurmodus/klausur/ergebnis')}>
              Abgeben
            </Button>
          </>
        ) : (
          <Button variant="primary" fullWidth onClick={() => navigate('/klausurmodus/klausur/ergebnis')}>
            Abschicken
          </Button>
        )}
      </div>
    </div>
  )
}
