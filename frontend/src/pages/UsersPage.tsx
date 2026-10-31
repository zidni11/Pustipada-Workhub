import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { listDivisions } from '../api/divisions'
import { deleteUser, listUsers, updateUser } from '../api/users'
import { Avatar } from '../components/Avatar'
import { RoleBadge, UserStatusBadge } from '../components/Badges'
import {
  CellMeta,
  CellPerson,
  CellStack,
  CellTitle,
  DataTable,
  RowActions,
  type DataColumn,
} from '../components/DataTable'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { Pagination } from '../components/Pagination'
import { UserFormModal } from '../components/UserFormModal'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Notice } from '../components/ui/Notice'
import { Surface } from '../components/ui/Surface'
import { useAsync } from '../hooks/useAsync'
import type { User, UserRole } from '../types/api'
import styles from './UsersPage.module.css'

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
  const [pendingDelete, setPendingDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activatingId, setActivatingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

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

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const handleActivate = async (user: User) => {
    setActivatingId(user.id)
    setActionError(null)
    setActionSuccess(null)

    try {
      await updateUser(user.id, { is_active: true })
      setActionSuccess(`Akun ${user.name} berhasil diaktifkan.`)
      users.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setActivatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) {
      return
    }

    setDeleting(true)
    setActionError(null)

    try {
      await deleteUser(pendingDelete.id)
      setPendingDelete(null)

      if ((users.data?.data.length ?? 0) === 1 && page > 1) {
        setPage(page - 1)
      } else {
        users.reload()
      }
    } catch (error) {
      setActionError(getErrorMessage(error))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns: Array<DataColumn<User>> = [
    {
      key: 'user',
      header: 'Pengguna',
      render: (user) => (
        <CellPerson>
          <Avatar name={user.name} />
          <CellStack>
            <CellTitle>{user.name}</CellTitle>
            <CellMeta>{user.email}</CellMeta>
          </CellStack>
        </CellPerson>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: 'division',
      header: 'Divisi',
      render: (user) => user.division?.name ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <UserStatusBadge active={user.is_active} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (user) => (
        <RowActions>
          {user.is_active ? null : (
            <Button
              variant="secondary"
              size="sm"
              loading={activatingId === user.id}
              onClick={() => handleActivate(user)}
            >
              Aktifkan
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModal({ mode: 'edit', user })}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={styles.dangerAction}
            onClick={() => setPendingDelete(user)}
          >
            Hapus
          </Button>
        </RowActions>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Pengguna"
        description="Kelola akun, role, divisi, dan status aktif pengguna."
        actions={
          <Button onClick={() => setModal({ mode: 'create' })}>Pengguna Baru</Button>
        }
      />

      <Surface padding="none">
        <ListToolbar
          query={searchInput}
          onQueryChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Cari nama atau email..."
          searchLabel="Cari pengguna"
          filters={
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
          }
        />

        {actionError ? (
          <Notice className={styles.notice}>{actionError}</Notice>
        ) : null}

        {actionSuccess ? (
          <Notice tone="success" className={styles.notice}>
            {actionSuccess}
          </Notice>
        ) : null}

        {users.loading ? (
          <LoadingState label="Memuat pengguna..." />
        ) : users.error ? (
          <ErrorState message={users.error} onRetry={users.reload} />
        ) : (users.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Tidak ada pengguna" description="Belum ada akun yang cocok." />
        ) : (
          <>
            <DataTable
              label="Daftar pengguna"
              rows={users.data?.data ?? []}
              columns={columns}
              getRowKey={(user) => user.id}
            />
            {users.data ? (
              <Pagination
                meta={users.data.meta}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            ) : null}
          </>
        )}
      </Surface>

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

      {pendingDelete ? (
        <ConfirmDialog
          title="Hapus pengguna?"
          message={`Akun ${pendingDelete.name} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus pengguna"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  )
}
