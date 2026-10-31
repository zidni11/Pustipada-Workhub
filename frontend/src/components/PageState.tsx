import type { ReactNode } from 'react'
import { Button } from './ui/Button'
import { Skeleton } from './ui/Skeleton'
import styles from './PageState.module.css'

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className={styles.loading} role="status" aria-label={label}>
      {[0, 1, 2].map((row) => (
        <div key={row} className={styles.skeletonRow}>
          <Skeleton lines={2} className={styles.skeletonMain} />
          <Skeleton width="72px" height="20px" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.state} role="alert">
      <strong className={styles.errorTitle}>Terjadi kesalahan</strong>
      <p className={styles.description}>{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  titleAs?: 'p' | 'h1' | 'h2'
}

export function EmptyState({
  title,
  description,
  action,
  titleAs: Title = 'p',
}: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <Title className={styles.title}>{title}</Title>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action}
    </div>
  )
}
