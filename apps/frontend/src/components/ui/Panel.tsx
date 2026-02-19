import React from 'react'
import { cn } from '../../lib/utils'

export const Panel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <section
    className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900', className)}
    {...props}
  />
)

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
}

export const SplitPane: React.FC<SplitPaneProps> = ({ left, right, className }) => (
  <div className={cn('grid gap-4 xl:grid-cols-[400px_1fr]', className)}>
    {left}
    {right}
  </div>
)
