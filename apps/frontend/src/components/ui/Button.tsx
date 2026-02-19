import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    iconLeft,
    iconRight,
    children,
    disabled,
    ...props
  }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50',
        {
          'border-transparent bg-primary text-white shadow-sm hover:bg-primary/90': variant === 'default',
          'border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700': variant === 'destructive',
          'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700': variant === 'outline',
          'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700': variant === 'secondary',
          'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white': variant === 'ghost',
          'border-transparent bg-transparent p-0 text-primary underline-offset-4 hover:underline': variant === 'link',
          'h-10 px-4': size === 'default',
          'h-9 px-3 text-xs': size === 'sm',
          'h-11 px-6 text-base': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className,
      )}
      {...props}
    >
      {loading ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  ),
)

Button.displayName = 'Button'

export { Button }
