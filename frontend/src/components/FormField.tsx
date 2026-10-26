import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={className ? `form-field ${className}` : 'form-field'}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="form-hint">{hint}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
}
