import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { deleteDivision, listDivisions } from '../api/divisions'
import { ActiveBadge } from '../components/Badges'
import { DivisionFormModal } from '../components/DivisionFormModal'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { useAsync } from '../hooks/useAsync'
import type { Division } from '../types/api'

type DivisionModalState = { mode: 'create' } | { mode: 'edit'; division: Division } | null

export function DivisionsPage() {
  const [modal, setModal] = useState<DivisionModalState>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const divisions = useAsync(() => listDivisions(), [])

  const handleDelete = async (division: Division) => {
    if (!window.confirm(`Hapus divisi ${division.name}?`)) {
      return
    }

    setActionError(null)

    try {
      await deleteDivision(division.id)
      divisions.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Divisi"
        description="Data master divisi yang dipakai pada akun dan tugas."
        actions={
          <button
            type="button"
            className="button button-primary"
            onClick={() => setModal({ mode: 'create' })}
          >
            Divisi Baru
          </button>
        }
      />

      <section className="panel">
        {actionError ? <div className="alert alert-error">{actionError}</div> : null}

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
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Divisi</th>
                  <th>Deskripsi</th>
                  <th>Status</th>
                  <th className="cell-actions">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {divisions.data?.data.map((division) => (
                  <tr key={division.id}>
                    <td>
                      <span className="table-title">{division.name}</span>
                      <span className="table-subtitle">{division.code}</span>
                    </td>
                    <td>{division.description ?? '—'}</td>
                    <td>
                      <ActiveBadge active={division.is_active} />
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => setModal({ mode: 'edit', division })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button button-danger-outline button-small"
                        onClick={() => handleDelete(division)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
    </>
  )
}
