import { Badge } from '../ui/Badge'

interface AIFeedbackCardProps {
  score: number
  maxScore: number
  grade: string
  strengths: string[]
  weaknesses: string[]
  suggestion: string
}

export function AIFeedbackCard({ score, maxScore, grade, strengths, weaknesses, suggestion }: AIFeedbackCardProps) {
  const percentage = (score / maxScore) * 100

  return (
    <div className="space-y-4">
      {/* Score meter */}
      <div className="bg-surface border border-border rounded-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Ergebnis</p>
            <p className="text-3xl font-bold text-text-primary">
              {score} <span className="text-text-secondary text-lg font-normal">/ {maxScore} Punkte</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Note</p>
            <Badge color="success" className="text-lg px-3 py-1">{grade}</Badge>
          </div>
        </div>
        <div className="w-full bg-border rounded-pill h-2 overflow-hidden">
          <div
            className="h-full rounded-pill transition-all duration-700"
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage >= 80 ? '#4ADE80' : percentage >= 60 ? '#FACC15' : '#F87171',
            }}
          />
        </div>
        <p className="text-right text-xs text-text-muted mt-1">{Math.round(percentage)}%</p>
      </div>

      {/* Stärken */}
      <div className="bg-success/5 border border-success/20 rounded-card p-4 space-y-2">
        <p className="text-success text-sm font-semibold flex items-center gap-2">
          <span>✓</span> Stärken
        </p>
        <ul className="space-y-2">
          {strengths.map((s, i) => (
            <li key={i} className="text-text-secondary text-sm flex gap-2">
              <span className="text-success mt-0.5 shrink-0">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Schwächen */}
      <div className="bg-warning/5 border border-warning/20 rounded-card p-4 space-y-2">
        <p className="text-warning text-sm font-semibold flex items-center gap-2">
          <span>!</span> Schwächen
        </p>
        <ul className="space-y-2">
          {weaknesses.map((w, i) => (
            <li key={i} className="text-text-secondary text-sm flex gap-2">
              <span className="text-warning mt-0.5 shrink-0">·</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Verbesserungsvorschlag */}
      <div className="bg-accent-soft border border-accent/20 rounded-card p-4 space-y-2">
        <p className="text-accent text-sm font-semibold flex items-center gap-2">
          <span>→</span> Verbesserungsvorschlag
        </p>
        <p className="text-text-secondary text-sm leading-relaxed">{suggestion}</p>
      </div>
    </div>
  )
}
