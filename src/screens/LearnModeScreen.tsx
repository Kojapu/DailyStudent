import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlashCard } from '../components/learn/FlashCard'
import { ExamQuestion } from '../components/learn/ExamQuestion'
import { Button } from '../components/ui/Button'
import { Header } from '../components/ui/Header'
import { flashCards, examQuestions, subjects } from '../data/mockData'

export function LearnModeScreen() {
  const [mode, setMode] = useState<'karteikarten' | 'klausur'>('karteikarten')
  const [cardIndex, setCardIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const navigate = useNavigate()

  const geschichteCards = flashCards.filter((f) => f.subjectId === 'geschichte')
  const currentCard = geschichteCards[cardIndex]
  const geschichteSubject = subjects.find((s) => s.id === 'geschichte')
  const currentQuestion = examQuestions[0]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <Header title="Lernen" />

      {/* Mode toggle */}
      <div className="mx-4 mb-4 bg-surface border border-border rounded-card p-1 flex">
        {(['karteikarten', 'klausur'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-btn text-sm font-medium capitalize transition-all duration-150 ${
              mode === m ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {m === 'karteikarten' ? 'Karteikarten' : 'Klausur'}
          </button>
        ))}
      </div>

      <div className="px-4 flex-1">
        {mode === 'karteikarten' && currentCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Geschichte</span>
              <span>{cardIndex + 1} / {geschichteCards.length}</span>
            </div>

            {/* Card wrapper with fixed height */}
            <div className="relative" style={{ height: '260px' }}>
              <FlashCard
                front={currentCard.front}
                back={currentCard.back}
                subjectName="Geschichte"
                subjectColor={geschichteSubject?.color}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setCardIndex((i) => (i + 1) % geschichteCards.length)}
              >
                Nochmal
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setCardIndex((i) => (i + 1) % geschichteCards.length)}
              >
                Weiß ich ✓
              </Button>
            </div>
          </div>
        )}

        {mode === 'klausur' && (
          <div className="space-y-4">
            <ExamQuestion
              text={currentQuestion.text}
              points={currentQuestion.points}
              operator={currentQuestion.operator}
            />
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Schreibe deine Antwort hier..."
              className="w-full h-48 bg-surface border border-border rounded-card p-4 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-colors"
            />
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/klausurmodus/klausur/ergebnis')}
            >
              Antwort einreichen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
