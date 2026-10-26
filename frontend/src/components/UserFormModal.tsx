import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '../api/client'
import { createUser, updateUser } from '../api/users'
import type { Division, User, UserRole } from '../types/api'
import { FormField } from './FormField'
import { Modal } from './Modal'

interface UserFormModalProps {
  user?: User
  divisions: Division[]
  onClose: () => void
  onSaved: (user: User) => void
}

const ROLES: UserRole[] = ['admin', 'pimpinan', 'anggota']

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  pimpinan: 'Pimpinan',
  anggota: 'Anggota',
}

export function UserFormModal({ user, divisions, onClose, onSaved }: UserFormModalProps) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'anggota')
  const [divisionId, setDivisionId] = useState(
    user?.division_id ? String(user.division_id) : '',
  )
  const [isActive, setIsActive] = useState(user?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string[]> = {}

    if (!name.trim()) {
      nextErrors.name = ['Nama wajib diisi.']
    }

    if (!email.trim()) {
      nextErrors.email = ['Email wajib diisi.']
    }

    if (!user && password.length < 8) {
      nextErrors.password = ['Password minimal 8 karakter.']
    }

    if (user && password && password.length < 8) {
      nextErrors.password = ['Password minimal 8 karakter.']
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    try {
      const response = user
        ? await updateUser(user.id, {
            name: name.trim(),
            email: email.trim(),
            role,
            division_id: divisionId ? Number(divisionId) : null,
            is_active: isActive,
            ...(password ? { password } : {}),
          })
        : await createUser({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            division_id: divisionId ? Number(divisionId) : null,
            is_active: isActive,
          })

      onSaved(response.data)
    } catch (err) {
      setError(getErrorMessage(err))

      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={user ? 'Edit Pengguna' : 'Pengguna Baru'}
      subtitle={user ? 'Perbarui data akun pengguna.' : 'Buat akun baru untuk tim.'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-ghost" onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button type="submit" form="user-form" className="button button-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengguna'}
          </button>
        </>
      }
    >
      <form id="user-form" className="form-grid" onSubmit={handleSubmit}>
        {error ? <div className="alert alert-error">{error}</div> : null}

        <FormField label="Nama" htmlFor="user-name" error={fieldErrors.name?.[0]}>
          <input
            id="user-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            required
          />
        </FormField>

        <FormField label="Email" htmlFor="user-email" error={fieldErrors.email?.[0]}>
          <input
            id="user-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={255}
            required
          />
        </FormField>

        <FormField
          label={user ? 'Password baru' : 'Password'}
          htmlFor="user-password"
          hint={user ? 'Kosongkan jika tidak ingin mengubah password.' : 'Minimal 8 karakter.'}
          error={fieldErrors.password?.[0]}
        >
          <input
            id="user-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            autoComplete="new-password"
            required={!user}
          />
        </FormField>

        <div className="form-row">
          <FormField label="Role" htmlFor="user-role" error={fieldErrors.role?.[0]}>
            <select
              id="user-role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              {ROLES.map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Divisi" htmlFor="user-division" error={fieldErrors.division_id?.[0]}>
            <select
              id="user-division"
              value={divisionId}
              onChange={(event) => setDivisionId(event.target.value)}
            >
              <option value="">Tanpa divisi</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                  {division.is_active ? '' : ' (nonaktif)'}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <span>
            Akun aktif
            <small>Pengguna nonaktif tidak bisa login.</small>
          </span>
        </label>
      </form>
    </Modal>
  )
}
