import { useState } from 'react'
import { AuthModeSwitch, type AuthMode } from '../components/auth/AuthModeSwitch'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import type { RegistrationSuccess } from '../composables/useRegistration'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode)
    setSuccessMessage(null)
  }

  const handleRegistered = (result: RegistrationSuccess) => {
    setRegisteredEmail(result.email)
    setSuccessMessage(result.message)
    setMode('login')
  }

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.monogram} aria-hidden="true">
              PW
            </span>
            <div className={styles.brandText}>
              <strong>Pustipada</strong>
              <span>Workhub</span>
            </div>
          </div>
          <h1>{mode === 'login' ? 'Masuk ke Workhub' : 'Daftar Akun Baru'}</h1>
          <p>
            {mode === 'login'
              ? 'Gunakan akun internal yang diberikan admin.'
              : 'Lengkapi data untuk mengajukan akun anggota baru.'}
          </p>
        </header>

        <AuthModeSwitch mode={mode} onChange={handleModeChange} />

        {mode === 'login' ? (
          <LoginForm
            initialEmail={registeredEmail}
            successMessage={successMessage}
          />
        ) : (
          <RegisterForm onSuccess={handleRegistered} />
        )}
      </main>
    </div>
  )
}
