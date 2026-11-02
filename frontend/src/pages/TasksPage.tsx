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
import { TaskExportMenu } from '../components/tasks/TaskExportMenu'
import { Button } from '../components/ui/Button'
import { Notice } from '../components/ui/Notice'
import { Surface } from '../components/ui/Surface'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { navigate, routePaths } from '../hooks/useHashRoute'
import { formatDate } from '../lib/format'
import {
  ACTIVE_TASK_STATUSES,
  canManageTasks,
  TASK_STATUS_LABELS,
} from '../lib/tasks'
import type { Task, TaskListParams, TaskStatus } from '../types/api'
import styles from './TasksPage.module.css'

interface TasksPageProps {
  create?: boolean
}

type AssignmentRole = '' | 'pic' | 'supporting'

export function TasksPage({ create }: TasksPageProps) {
  const { user } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [divisionId, setDivisionId] = useState('')
  const [picId, setPicId] = useState('')
  const [assignmentRole, setAssignmentRole] = useState<AssignmentRole>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(
    Boolean(create && user && canManageTasks(user)),
  )
  const [exportError, setExportError] = useState<string | null>(null)

  const canManage = user ? canManageTasks(user) : false

  const divisions = useAsync(() => listDivisions(), [])
  const users = useAsync(
    () => (canManage ? listAllUsers() : Promise.resolve([])),
    [canManage],
  )

  const filters: Omit<TaskListParams, 'page'> = {
    view_mode: 'active',
    search: search || undefined,
    status: status || undefined,
    division_id: divisionId ? Number(divisionId) : undefined,
    pic_id: picId ? Number(picId) : undefined,
    assignment_role: assignmentRole || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const tasks = useAsync(
    () => listTasks({ ...filters, page }),
    [
      search,
      status,
      divisionId,
      picId,
      assignmentRole,
      dateFrom,
      dateTo,
      page,
    ],
  )

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const resetFilters = () => {
    setStatus('')
    setDivisionId('')
    setPicId('')
    setAssignmentRole('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setSearchInput('')
    setPage(1)
  }

  const handleSaved = (task: Task) => {
    setShowForm(false)
    tasks.reload()
    navigate(routePaths.task(task.id))
  }

  const closeForm = () => {
    setShowForm(false)

    if (create) {
      navigate(routePaths.tasks)
    }
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
      render: (task) => task.pic?.name ?? '-',
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

  const activeFilterCount = [
    status,
    divisionId,
    picId,
    assignmentRole,
    dateFrom,
    dateTo,
    search,
  ].filter(Boolean).length

  return (
    <>
      <PageHeader
        title="Tugas"
        description="Daftar pekerjaan aktif, penanggung jawab, dan progresnya."
        actions={
          <>
            <TaskExportMenu
              params={filters}
              view="active"
              onError={setExportError}
            />
            {canManage ? (
              <Button onClick={() => setShowForm(true)}>Tugas Baru</Button>
            ) : null}
          </>
        }
      />

      {exportError ? (
        <Notice className={styles.notice}>{exportError}</Notice>
      ) : null}

      <Surface padding="none">
        <ListToolbar
          query={searchInput}
          onQueryChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Cari judul atau deskripsi tugas..."
          searchLabel="Cari tugas"
          filters={
            <div className={styles.filters}>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as TaskStatus | '')
                  setPage(1)
                }}
                aria-label="Filter status"
              >
                <option value="">Semua status</option>
                {ACTIVE_TASK_STATUSES.map((value) => (
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

              {canManage ? (
                <select
                  value={picId}
                  onChange={(event) => {
                    setPicId(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter PIC"
                >
                  <option value="">Semua PIC</option>
                  {(users.data ?? [])
                    .filter((member) => member.is_active)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              ) : null}

              {user?.role === 'anggota' ? (
                <select
                  value={assignmentRole}
                  onChange={(event) => {
                    setAssignmentRole(event.target.value as AssignmentRole)
                    setPage(1)
                  }}
                  aria-label="Filter peran saya"
                >
                  <option value="">Semua peran saya</option>
                  <option value="pic">Sebagai PIC</option>
                  <option value="supporting">Sebagai pendukung</option>
                </select>
              ) : null}

              <label className={styles.dateField}>
                <span>Dari</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Tanggal mulai filter"
                />
              </label>

              <label className={styles.dateField}>
                <span>Sampai</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Tanggal akhir filter"
                />
              </label>

              {activeFilterCount > 0 ? (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset ({activeFilterCount})
                </Button>
              ) : null}
            </div>
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
          onClose={closeForm}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  )
}
