import React from 'react'
import { Badge, BadgeProps } from './Badge'

interface StatusChipProps extends Omit<BadgeProps, 'variant'> {
  tone?: BadgeProps['variant']
}

const StatusChip: React.FC<StatusChipProps> = ({ tone = 'outline', ...props }) => (
  <Badge variant={tone} {...props} />
)

export default StatusChip
