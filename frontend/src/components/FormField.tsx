import type { ReactNode } from 'react'
import { Field } from './ui/Field'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField(props: FormFieldProps) {
  return <Field {...props} />
}
