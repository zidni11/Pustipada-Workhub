import { listPublicDivisions } from '../../api/divisions'
import { useAsync } from '../../hooks/useAsync'
import { useRegistration, type RegistrationSuccess } from '../../composables/useRegistration'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Notice } from '../ui/Notice'
import styles from './RegisterForm.module.css'

interface RegisterFormProps {
  onSuccess: (result: RegistrationSuccess) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const divisions = useAsync(() => listPublicDivisions(), [])
  const registration = useRegistration({ onSuccess })
  const divisionOptions = divisions.data?.data ?? []
  const divisionsReady =
    !divisions.loading && !divisions.error && divisionOptions.length > 0

  return (
    <form className={styles.form} onSubmit={registration.handleSubmit}>
      {registration.error ? (
        <Notice tone="danger">{registration.error}</Notice>
      ) : null}

      <Field
        label="Nama Lengkap"
        htmlFor="register-name"
        error={registration.fieldErrors.name?.[0]}
      >
        <input
          id="register-name"
          type="text"
          value={registration.name}
          onChange={(event) => registration.setName(event.target.value)}
          maxLength={255}
          autoComplete="name"
          placeholder="Nama lengkap Anda"
          autoFocus
          required
        />
      </Field>

      <Field
        label="Email"
        htmlFor="register-email"
        error={registration.fieldErrors.email?.[0]}
      >
        <input
          id="register-email"
          type="email"
          value={registration.email}
          onChange={(event) => registration.setEmail(event.target.value)}
          maxLength={255}
          autoComplete="email"
          placeholder="nama@pustipada.test"
          required
        />
      </Field>

      {divisions.error ? (
        <div className={styles.lookup}>
          <Notice tone="danger">{divisions.error}</Notice>
          <Button variant="secondary" size="sm" onClick={divisions.reload}>
            Muat ulang divisi
          </Button>
        </div>
      ) : (
        <Field
          label="Divisi"
          htmlFor="register-division"
          hint={
            divisions.loading
              ? 'Memuat daftar divisi aktif...'
              : divisionOptions.length === 0
                ? 'Belum ada divisi aktif untuk dipilih.'
                : undefined
          }
          error={registration.fieldErrors.division_id?.[0]}
        >
          <select
            id="register-division"
            value={registration.divisionId}
            onChange={(event) => registration.setDivisionId(event.target.value)}
            disabled={divisions.loading || divisionOptions.length === 0}
            required
          >
            <option value="">
              {divisions.loading
                ? 'Memuat divisi...'
                : divisionOptions.length === 0
                  ? 'Tidak ada divisi aktif'
                  : 'Pilih divisi'}
            </option>
            {divisionOptions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.name} ({division.code})
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field
        label="Password"
        htmlFor="register-password"
        hint="Minimal 8 karakter."
        error={registration.fieldErrors.password?.[0]}
      >
        <input
          id="register-password"
          type="password"
          value={registration.password}
          onChange={(event) => registration.setPassword(event.target.value)}
          minLength={8}
          autoComplete="new-password"
          placeholder="Buat password"
          required
        />
      </Field>

      <Field
        label="Konfirmasi Password"
        htmlFor="register-password-confirmation"
        error={registration.fieldErrors.password_confirmation?.[0]}
      >
        <input
          id="register-password-confirmation"
          type="password"
          value={registration.passwordConfirmation}
          onChange={(event) =>
            registration.setPasswordConfirmation(event.target.value)
          }
          minLength={8}
          autoComplete="new-password"
          placeholder="Ulangi password"
          required
        />
      </Field>

      <Button
        type="submit"
        fullWidth
        loading={registration.submitting}
        disabled={!divisionsReady}
      >
        Daftar Akun Baru
      </Button>

      <p className={styles.note}>
        Akun baru berstatus nonaktif sampai disetujui Admin.
      </p>
    </form>
  )
}
