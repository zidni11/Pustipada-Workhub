import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { BadgeTone } from './Badge'
import styles from './Stat.module.css'

interface StatProps {
  label: string
  value: ReactNode
  tone?: BadgeTone
  hint?: string
  loading?: boolean
  className?: string
}

export function Stat({ label, value, tone = 'neutral', hint, loading = false, className }: StatProps) {
  return (
    <div className={cn(styles.stat, className)}>
      <span className={styles.label}>
        <span className={cn(styles.dot, styles[tone])} aria-hidden="true" />
        {label}
      </span>
      {loading ? (
        <span className={styles.loading} aria-hidden="true" />
      ) : (
        <strong className={styles.value}>{value}</strong>
      )}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  )
}
