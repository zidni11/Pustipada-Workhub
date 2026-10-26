import type { ReactNode } from 'react'

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="page-state">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="page-state page-state-error">
      <strong>Terjadi kesalahan</strong>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="button button-ghost" onClick={onRetry}>
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="page-state">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}
