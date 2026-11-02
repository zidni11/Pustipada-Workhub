import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { BadgeTone } from './Badge'
import styles from './IconBadge.module.css'

interface IconBadgeProps {
  children: ReactNode
  tone?: BadgeTone
  size?: 'sm' | 'md'
  className?: string
}

export function IconBadge({
  children,
  tone = 'neutral',
  size = 'md',
  className,
}: IconBadgeProps) {
  return (
    <span
      className={cn(styles.icon, styles[tone], styles[size], className)}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
