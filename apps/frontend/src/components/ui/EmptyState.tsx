import React from 'react'
import { Card, CardContent } from './Card'
import Icon from './Icon'

interface EmptyStateProps {
  title: string
  description: string
  icon?: string
  action?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = 'inbox', action }) => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <Icon name={icon} />
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </CardContent>
  </Card>
)

export default EmptyState
