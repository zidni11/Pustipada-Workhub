import { useState } from 'react'
import { listDivisions } from '../api/divisions'
import { listTasks } from '../api/tasks'
import { listAllUsers } from '../api/users'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import {
  CellMeta,
  CellMono,
  CellStack,
  CellTitle,
  DataTable,
  type DataColumn,
} from '../components/DataTable'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { Pagination } from '../components/Pagination'
import { TaskFormModal } from '../components/TaskFormModal'
import { Button } from '../components/ui/Button'
import { Surface } from '../components/ui/Surface'
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

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const handleSaved = (task: Task) => {
    setShowForm(false)
    tasks.reload()
    navigate(routePaths.task(task.id))
  }

  const columns: Array<DataColumn<Task>> = [
    {
      key: 'title',
      header: 'Tugas',
      render: (task) => (
        <CellStack>
          <CellTitle href={`#${routePaths.task(task.id)}`}>{task.title}</CellTitle>
          <CellMeta>{task.description ?? 'Tanpa deskripsi'}</CellMeta>
        </CellStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: 'pic',
      header: 'PIC',
      render: (task) => task.pic?.name ?? '—',
    },
    {
      key: 'division',
      header: 'Divisi',
      render: (task) => task.division.name,
    },
    {
      key: 'priority',
      header: 'Prioritas',
      render: (task) => <PriorityBadge priority={task.priority} />,
    },
    {
      key: 'due',
      header: 'Tenggat',
      align: 'right',
      render: (task) => <CellMono>{formatDate(task.due_date)}</CellMono>,
    },
  ]

  return (
    <>
      <PageHeader
        title="Tugas"
        description="Daftar pekerjaan, penanggung jawab, dan progresnya."
        actions={
          canManage ? (
            <Button onClick={() => setShowForm(true)}>Tugas Baru</Button>
          ) : null
        }
      />

      <Surface padding="none">
        <ListToolbar
          query={searchInput}
          onQueryChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Cari judul tugas..."
          searchLabel="Cari tugas"
          filters={
            <>
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
            </>
          }
        />

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
            <DataTable
              label="Daftar tugas"
              rows={tasks.data?.data ?? []}
              columns={columns}
              getRowKey={(task) => task.id}
            />
            {tasks.data ? (
              <Pagination
                meta={tasks.data.meta}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            ) : null}
          </>
        )}
      </Surface>

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
