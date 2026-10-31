import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { deleteDivision, listDivisions } from '../api/divisions'
import { ActiveBadge } from '../components/Badges'
import {
  CellMeta,
  CellStack,
  CellTitle,
  DataTable,
  RowActions,
  type DataColumn,
} from '../components/DataTable'
import { DivisionFormModal } from '../components/DivisionFormModal'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Notice } from '../components/ui/Notice'
import { Surface } from '../components/ui/Surface'
import { useAsync } from '../hooks/useAsync'
import type { Division } from '../types/api'
import styles from './DivisionsPage.module.css'

type DivisionModalState = { mode: 'create' } | { mode: 'edit'; division: Division } | null

export function DivisionsPage() {
  const [modal, setModal] = useState<DivisionModalState>(null)
  const [pendingDelete, setPendingDelete] = useState<Division | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const divisions = useAsync(() => listDivisions(), [])

  const handleDelete = async () => {
    if (!pendingDelete) {
      return
    }

    setDeleting(true)
    setActionError(null)

    try {
      await deleteDivision(pendingDelete.id)
      setPendingDelete(null)
      divisions.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns: Array<DataColumn<Division>> = [
    {
      key: 'division',
      header: 'Divisi',
      render: (division) => (
        <CellStack>
          <CellTitle>{division.name}</CellTitle>
          <CellMeta>{division.code}</CellMeta>
        </CellStack>
      ),
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (division) => division.description ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (division) => <ActiveBadge active={division.is_active} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (division) => (
        <RowActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModal({ mode: 'edit', division })}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={styles.dangerAction}
            onClick={() => setPendingDelete(division)}
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
        title="Divisi"
        description="Data master divisi yang dipakai pada akun dan tugas."
        actions={
          <Button onClick={() => setModal({ mode: 'create' })}>Divisi Baru</Button>
        }
      />

      <Surface padding="none">
        {actionError ? (
          <Notice className={styles.notice}>{actionError}</Notice>
        ) : null}

        {divisions.loading ? (
          <LoadingState label="Memuat divisi..." />
        ) : divisions.error ? (
          <ErrorState message={divisions.error} onRetry={divisions.reload} />
        ) : (divisions.data?.data.length ?? 0) === 0 ? (
          <EmptyState
            title="Belum ada divisi"
            description="Tambahkan divisi pertama untuk mulai mengelompokkan tim."
          />
        ) : (
          <DataTable
            label="Daftar divisi"
            rows={divisions.data?.data ?? []}
            columns={columns}
            getRowKey={(division) => division.id}
          />
        )}
      </Surface>

      {modal ? (
        <DivisionFormModal
          division={modal.mode === 'edit' ? modal.division : undefined}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            divisions.reload()
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Hapus divisi?"
          message={`Divisi ${pendingDelete.name} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus divisi"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  )
}
