import React from 'react'
import { cn } from '../../lib/utils'

interface IconProps {
  name: string
  className?: string
  fill?: boolean
}

const Icon: React.FC<IconProps> = ({ name, className, fill = false }) => (
  <span
    className={cn('material-symbols-outlined text-[20px]', className)}
    style={fill ? { fontVariationSettings: '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24' } : undefined}
    aria-hidden="true"
  >
    {name}
  </span>
)

export default Icon
