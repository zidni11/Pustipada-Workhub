import { useId, type FormHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './FormLayout.module.css'

export function FormStack({
  className,
  children,
  ...rest
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn(styles.stack, className)} {...rest}>
      {children}
    </form>
  )
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export function CheckboxField({
  label,
  hint,
  id,
  className,
  ...rest
}: CheckboxFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <label className={cn(styles.checkbox, className)} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className={styles.checkboxInput}
        aria-describedby={hintId}
        {...rest}
      />
      <span className={styles.checkboxText}>
        <span>{label}</span>
        {hint ? (
          <span className={styles.checkboxHint} id={hintId}>
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  )
}

interface FormFieldsetProps {
  legend: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormFieldset({
  legend,
  hint,
  error,
  children,
  className,
}: FormFieldsetProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <fieldset
      className={cn(styles.fieldset, className)}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
