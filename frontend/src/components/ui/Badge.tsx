import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

interface BadgeProps {
  tone?: BadgeTone
  dot?: boolean
  mono?: boolean
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', dot = true, mono = false, className, children }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], mono && styles.mono, className)}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
