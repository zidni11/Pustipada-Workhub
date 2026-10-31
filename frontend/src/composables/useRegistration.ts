import { useState, type FormEvent } from 'react'
import { register } from '../api/auth'
import { ApiError, getErrorMessage } from '../api/client'

export interface RegistrationSuccess {
  email: string
  message: string
}

interface UseRegistrationOptions {
  onSuccess: (result: RegistrationSuccess) => void
}

export function useRegistration({ onSuccess }: UseRegistrationOptions) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string[]> = {}

    if (!name.trim()) {
      nextErrors.name = ['Nama lengkap wajib diisi.']
    }

    if (!email.trim()) {
      nextErrors.email = ['Email wajib diisi.']
    }

    if (!divisionId) {
      nextErrors.division_id = ['Divisi wajib dipilih.']
    }

    if (password.length < 8) {
      nextErrors.password = ['Password minimal 8 karakter.']
    }

    if (!passwordConfirmation) {
      nextErrors.password_confirmation = ['Konfirmasi password wajib diisi.']
    } else if (passwordConfirmation !== password) {
      nextErrors.password_confirmation = ['Konfirmasi password tidak cocok.']
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        division_id: Number(divisionId),
      })

      onSuccess({ email: email.trim(), message: response.message })
    } catch (err) {
      setError(getErrorMessage(err))

      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    divisionId,
    setDivisionId,
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    error,
    fieldErrors,
    submitting,
    handleSubmit,
  }
}
