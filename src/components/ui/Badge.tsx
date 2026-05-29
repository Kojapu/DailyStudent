import { type HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'muted'
}

export function Badge({ color = 'accent', className = '', children, ...props }: BadgeProps) {
  const colors = {
    accent:  'icon-accent text-accent',
    success: 'icon-success text-success',
    warning: 'icon-warning text-warning',
    danger:  'icon-danger text-danger',
    muted:   'bg-surface-hover text-text-muted',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-semibold tracking-wide ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
