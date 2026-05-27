import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  right?: ReactNode
}

export function Header({ title, subtitle, showBack, right }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-4 pt-12 pb-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-xl font-semibold text-text-primary leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}
