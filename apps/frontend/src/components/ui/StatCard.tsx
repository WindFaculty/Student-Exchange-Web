import React from 'react'
import { Card } from './Card'
import Icon from './Icon'

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  trend?: string
  trendTone?: 'positive' | 'negative' | 'neutral'
}

const toneClass: Record<NonNullable<StatCardProps['trendTone']>, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-slate-500 dark:text-slate-400',
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendTone = 'neutral' }) => (
  <Card className="relative h-full overflow-hidden p-5">
    <div className="absolute right-3 top-3 text-slate-200 dark:text-slate-700">
      <Icon name={icon} className="text-5xl" />
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    {trend ? <p className={`mt-2 text-xs font-medium ${toneClass[trendTone]}`}>{trend}</p> : null}
  </Card>
)

export default StatCard
