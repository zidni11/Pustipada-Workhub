import { cn } from '../../lib/cn'
import styles from './AuthModeSwitch.module.css'

export type AuthMode = 'login' | 'register'

interface AuthModeSwitchProps {
  mode: AuthMode
  onChange: (mode: AuthMode) => void
}

const OPTIONS: Array<{ mode: AuthMode; label: string }> = [
  { mode: 'login', label: 'Masuk' },
  { mode: 'register', label: 'Daftar Akun Baru' },
]

export function AuthModeSwitch({ mode, onChange }: AuthModeSwitchProps) {
  return (
    <div className={styles.switch} role="group" aria-label="Mode autentikasi">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          className={cn(styles.option, mode === option.mode && styles.active)}
          onClick={() => onChange(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
