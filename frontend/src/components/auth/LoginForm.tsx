import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '../../api/client'
import { navigate, routePaths } from '../../hooks/useHashRoute'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Notice } from '../ui/Notice'
import styles from './LoginForm.module.css'

interface DemoAccount {
  role: string
  email: string
  description: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    email: 'admin@pustipada.test',
    description: 'Kelola akun pengguna dan divisi',
  },
  {
    role: 'Pimpinan',
    email: 'pimpinan@pustipada.test',
    description: 'Buat, atur, dan review tugas',
  },
  {
    role: 'Anggota',
    email: 'anggota@pustipada.test',
    description: 'Kerjakan tugas yang di-assign',
  },
]

interface LoginFormProps {
  initialEmail?: string
  successMessage?: string | null
}

export function LoginForm({ initialEmail = '', successMessage = null }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setFieldErrors({
        ...(email.trim() ? {} : { email: ['Email wajib diisi.'] }),
        ...(password ? {} : { password: ['Password wajib diisi.'] }),
      })
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      await login(email.trim(), password)
      navigate(routePaths.dashboard)
    } catch (err) {
      setError(getErrorMessage(err))

      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (account: DemoAccount) => {
    setEmail(account.email)
    setPassword('password')
    setError(null)
    setFieldErrors({})
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        {successMessage ? (
          <Notice tone="success" className={styles.success}>
            {successMessage}
          </Notice>
        ) : null}

        {error ? (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        ) : null}

        <Field label="Email" htmlFor="login-email" error={fieldErrors.email?.[0]}>
          <input
            id="login-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@pustipada.test"
            autoComplete="email"
            autoFocus
            required
          />
        </Field>

        <Field label="Password" htmlFor="login-password" error={fieldErrors.password?.[0]}>
          <input
            id="login-password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password akun"
            autoComplete="current-password"
            required
          />
        </Field>

        <Button type="submit" fullWidth loading={submitting}>
          Masuk
        </Button>
      </form>

      <section className={styles.demo} aria-labelledby="demo-heading">
        <h2 id="demo-heading">Akun demo</h2>
        <p>
          Pilih peran untuk mengisi email. Password:{' '}
          <code className={styles.demoCode}>password</code>
        </p>
        <div className={styles.demoList}>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className={styles.demoRow}
              onClick={() => fillDemo(account)}
            >
              <span className={styles.demoRole}>{account.role}</span>
              <span className={styles.demoEmail}>{account.email}</span>
              <span className={styles.demoDesc}>{account.description}</span>
            </button>
          ))}
        </div>
      </section>

      <p className={styles.footnote}>
        Akses internal. Hubungi admin bila akun belum aktif.
      </p>
    </>
  )
}
