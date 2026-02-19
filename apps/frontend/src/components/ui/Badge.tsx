import * as React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      {
        'border-transparent bg-primary/10 text-primary': variant === 'default' || variant === 'info',
        'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300': variant === 'secondary',
        'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': variant === 'destructive',
        'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300': variant === 'outline',
        'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300': variant === 'success',
        'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300': variant === 'warning',
      },
      className,
    )}
    {...props}
  />
)

export { Badge }
