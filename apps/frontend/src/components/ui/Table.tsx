import React from 'react'
import { cn } from '../../lib/utils'

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <table className={cn('w-full text-left text-sm', className)} {...props} />
)

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/70', className)} {...props} />
)

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800', className)} {...props} />
)

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60', className)} {...props} />
)

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400', className)} {...props} />
)

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3 text-slate-700 dark:text-slate-200', className)} {...props} />
)
