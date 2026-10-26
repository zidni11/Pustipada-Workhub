import { useState, type FormEvent } from 'react'
import { listDivisions } from '../api/divisions'
import { listTasks } from '../api/tasks'
import { listAllUsers } from '../api/users'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { Pagination } from '../components/Pagination'
import { TaskFormModal } from '../components/TaskFormModal'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { navigate, routePaths } from '../hooks/useHashRoute'
import { formatDate } from '../lib/format'
import {
  canManageTasks,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from '../lib/tasks'
import type { Task, TaskStatus } from '../types/api'

export function TasksPage() {
  const { user } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [divisionId, setDivisionId] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const canManage = user ? canManageTasks(user) : false

  const divisions = useAsync(() => listDivisions(), [])
  const users = useAsync(
    () => (canManage ? listAllUsers() : Promise.resolve([])),
    [canManage],
  )
  const tasks = useAsync(
    () =>
      listTasks({
        search: search || undefined,
        status: status || undefined,
        division_id: divisionId ? Number(divisionId) : undefined,
        page,
      }),
    [search, status, divisionId, page],
  )

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const handleSaved = (task: Task) => {
    setShowForm(false)
    tasks.reload()
    navigate(routePaths.task(task.id))
  }

  return (
    <>
      <PageHeader
        title="Tugas"
        description="Daftar pekerjaan, penanggung jawab, dan progresnya."
        actions={
          canManage ? (
            <button type="button" className="button button-primary" onClick={() => setShowForm(true)}>
              Tugas Baru
            </button>
          ) : null
        }
      />

      <section className="panel">
        <div className="toolbar">
          <form className="toolbar-search" onSubmit={handleSearch}>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari judul tugas..."
              aria-label="Cari tugas"
            />
            <button type="submit" className="button button-ghost">
              Cari
            </button>
          </form>

          <div className="toolbar-filters">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TaskStatus | '')
                setPage(1)
              }}
              aria-label="Filter status"
            >
              <option value="">Semua status</option>
              {TASK_STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {TASK_STATUS_LABELS[value]}
                </option>
              ))}
            </select>

            <select
              value={divisionId}
              onChange={(event) => {
                setDivisionId(event.target.value)
                setPage(1)
              }}
              aria-label="Filter divisi"
            >
              <option value="">Semua divisi</option>
              {(divisions.data?.data ?? []).map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {tasks.loading ? (
          <LoadingState label="Memuat tugas..." />
        ) : tasks.error ? (
          <ErrorState message={tasks.error} onRetry={tasks.reload} />
        ) : (tasks.data?.data.length ?? 0) === 0 ? (
          <EmptyState
            title="Tidak ada tugas"
            description="Belum ada tugas yang cocok dengan filter ini."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tugas</th>
                    <th>Status</th>
                    <th>PIC</th>
                    <th>Divisi</th>
                    <th>Prioritas</th>
                    <th>Tenggat</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.data?.data.map((task) => (
                    <tr
                      key={task.id}
                      className="clickable-row"
                      onClick={() => navigate(routePaths.task(task.id))}
                    >
                      <td>
                        <a
                          className="table-title"
                          href={`#${routePaths.task(task.id)}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {task.title}
                        </a>
                        <span className="table-subtitle">
                          {task.description ?? 'Tanpa deskripsi'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>{task.pic?.name ?? '—'}</td>
                      <td>{task.division.name}</td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>{formatDate(task.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tasks.data ? (
              <Pagination
                meta={tasks.data.meta}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            ) : null}
          </>
        )}
      </section>

      {showForm && user ? (
        <TaskFormModal
          divisions={divisions.data?.data ?? []}
          users={users.data ?? []}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  )
}
