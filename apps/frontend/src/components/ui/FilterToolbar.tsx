import React from 'react'
import { cn } from '../../lib/utils'

const FilterToolbar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      'mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-900',
      className,
    )}
    {...props}
  />
)

export default FilterToolbar
