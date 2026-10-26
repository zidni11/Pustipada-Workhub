import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '../api/client'
import { FormField } from '../components/FormField'
import { navigate, routePaths } from '../hooks/useHashRoute'
import { useAuth } from '../hooks/useAuth'

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

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
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
    <div className="login-page">
      <aside className="login-aside">
        <div className="brand brand-light">
          <span className="brand-mark">PW</span>
          <div className="brand-text">
            <strong>Pustipada</strong>
            <span>Workhub</span>
          </div>
        </div>

        <div className="login-aside-content">
          <p className="eyebrow">Ruang kerja internal</p>
          <h1>Kelola pekerjaan pustipada dalam satu tempat.</h1>
          <p>
            Tugas, penanggung jawab, divisi, dan alur review dari draft sampai selesai —
            tanpa tersebar di banyak dokumen.
          </p>
          <ul className="login-features">
            <li>Alur status tugas dengan review pimpinan</li>
            <li>Akses berbasis peran: admin, pimpinan, anggota</li>
            <li>Riwayat aktivitas setiap perubahan status</li>
          </ul>
        </div>

        <p className="login-aside-footer">Pustipada Workhub</p>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Masuk ke Workhub</h2>
            <p>Gunakan akun yang diberikan admin.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error ? <div className="alert alert-error">{error}</div> : null}

            <FormField label="Email" htmlFor="login-email" error={fieldErrors.email?.[0]}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@pustipada.test"
                autoComplete="email"
                autoFocus
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="login-password" error={fieldErrors.password?.[0]}>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password akun"
                autoComplete="current-password"
                required
              />
            </FormField>

            <button type="submit" className="button button-primary button-block" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="demo-accounts">
            <p>Akun demo</p>
            <div className="demo-account-list">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-account"
                  onClick={() => fillDemo(account)}
                >
                  <strong>{account.role}</strong>
                  <span>{account.description}</span>
                </button>
              ))}
            </div>
            <p className="demo-hint">Password semua akun demo: password</p>
          </div>
        </div>
      </main>
    </div>
  )
}
