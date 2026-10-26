import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/client'
import { listDivisions } from '../api/divisions'
import { deleteUser, listUsers } from '../api/users'
import { Avatar } from '../components/Avatar'
import { ActiveBadge, RoleBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { Pagination } from '../components/Pagination'
import { UserFormModal } from '../components/UserFormModal'
import { useAsync } from '../hooks/useAsync'
import type { User, UserRole } from '../types/api'

type UserModalState = { mode: 'create' } | { mode: 'edit'; user: User } | null

const ROLES: UserRole[] = ['admin', 'pimpinan', 'anggota']

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  pimpinan: 'Pimpinan',
  anggota: 'Anggota',
}

export function UsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<UserModalState>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const users = useAsync(
    () =>
      listUsers({
        search: search || undefined,
        role: role || undefined,
        page,
      }),
    [search, role, page],
  )
  const divisions = useAsync(() => listDivisions(), [])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Hapus akun ${user.name}?`)) {
      return
    }

    setActionError(null)

    try {
      await deleteUser(user.id)
      users.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Pengguna"
        description="Kelola akun, role, divisi, dan status aktif pengguna."
        actions={
          <button
            type="button"
            className="button button-primary"
            onClick={() => setModal({ mode: 'create' })}
          >
            Pengguna Baru
          </button>
        }
      />

      <section className="panel">
        <div className="toolbar">
          <form className="toolbar-search" onSubmit={handleSearch}>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama atau email..."
              aria-label="Cari pengguna"
            />
            <button type="submit" className="button button-ghost">
              Cari
            </button>
          </form>

          <div className="toolbar-filters">
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | '')
                setPage(1)
              }}
              aria-label="Filter role"
            >
              <option value="">Semua role</option>
              {ROLES.map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {actionError ? <div className="alert alert-error">{actionError}</div> : null}

        {users.loading ? (
          <LoadingState label="Memuat pengguna..." />
        ) : users.error ? (
          <ErrorState message={users.error} onRetry={users.reload} />
        ) : (users.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Tidak ada pengguna" description="Belum ada akun yang cocok." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Role</th>
                    <th>Divisi</th>
                    <th>Status</th>
                    <th className="cell-actions">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.data.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="person-inline">
                          <Avatar name={user.name} />
                          <span>
                            <span className="table-title">{user.name}</span>
                            <span className="table-subtitle">{user.email}</span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <RoleBadge role={user.role} />
                      </td>
                      <td>{user.division?.name ?? '—'}</td>
                      <td>
                        <ActiveBadge active={user.is_active} />
                      </td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => setModal({ mode: 'edit', user })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button button-danger-outline button-small"
                          onClick={() => handleDelete(user)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.data ? (
              <Pagination
                meta={users.data.meta}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            ) : null}
          </>
        )}
      </section>

      {modal ? (
        <UserFormModal
          user={modal.mode === 'edit' ? modal.user : undefined}
          divisions={divisions.data?.data ?? []}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            users.reload()
          }}
        />
      ) : null}
    </>
  )
}
