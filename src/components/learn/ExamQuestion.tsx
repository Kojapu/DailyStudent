import { Badge } from '../ui/Badge'

interface ExamQuestionProps {
  text: string
  points: number
  operator: string
}

export function ExamQuestion({ text, points, operator }: ExamQuestionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge color="accent">{operator}</Badge>
        <Badge color="muted">{points} Punkte</Badge>
      </div>
      <p className="text-text-primary font-medium leading-relaxed">{text}</p>
    </div>
  )
}
