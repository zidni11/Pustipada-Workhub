import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './Field.module.css'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  let control = children

  if (isValidElement(children)) {
    control = cloneElement(children as ReactElement<Record<string, unknown>>, {
      'aria-describedby': describedBy,
      'aria-invalid': error ? true : undefined,
    })
  }

  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {control}
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
