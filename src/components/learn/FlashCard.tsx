import { useState } from 'react'
import { Badge } from '../ui/Badge'

interface FlashCardProps {
  front: string
  back: string
  subjectName?: string
  subjectColor?: string
}

export function FlashCard({ front, back, subjectName, subjectColor }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`flashcard-inner w-full`} style={{ minHeight: '240px' }}>
        {/* Front */}
        <div
          className={`flashcard-face absolute inset-0 bg-surface border border-border rounded-card p-6 flex flex-col justify-between ${flipped ? 'opacity-0 pointer-events-none' : ''}`}
          style={{ transition: 'opacity 0.25s', transitionDelay: flipped ? '0s' : '0.15s' }}
        >
          {subjectName && (
            <div>
              <Badge style={{ backgroundColor: subjectColor ? `${subjectColor}22` : undefined, color: subjectColor }}>
                {subjectName}
              </Badge>
            </div>
          )}
          <p className="text-text-primary font-medium text-lg leading-snug text-center flex-1 flex items-center justify-center">
            {front}
          </p>
          <p className="text-xs text-text-muted text-center">Tippen zum Umdrehen</p>
        </div>

        {/* Back */}
        <div
          className={`flashcard-back absolute inset-0 bg-accent-soft border border-accent/20 rounded-card p-6 flex flex-col justify-between ${!flipped ? 'opacity-0 pointer-events-none' : ''}`}
          style={{ transition: 'opacity 0.25s', transitionDelay: !flipped ? '0s' : '0.15s' }}
        >
          {subjectName && (
            <div>
              <Badge color="accent">{subjectName}</Badge>
            </div>
          )}
          <p className="text-text-primary text-sm leading-relaxed flex-1 flex items-center">
            {back}
          </p>
          <p className="text-xs text-text-muted text-center">Tippen zum Zurückdrehen</p>
        </div>
      </div>
    </div>
  )
}
