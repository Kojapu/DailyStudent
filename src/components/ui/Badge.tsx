import { type HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'muted'
}

export function Badge({ color = 'accent', className = '', children, ...props }: BadgeProps) {
  const colors = {
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    muted: 'bg-surface text-text-muted border border-border',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
