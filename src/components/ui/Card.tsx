import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export function Card({ hoverable, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-card p-4 ${hoverable ? 'hover:bg-surface-hover cursor-pointer transition-colors duration-150' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
