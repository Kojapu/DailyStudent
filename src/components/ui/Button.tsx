import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-all duration-150 disabled:opacity-40'

  const variants = {
    primary: 'bg-accent text-white hover:opacity-90 active:scale-95',
    secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-hover active:scale-95',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95',
    danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
