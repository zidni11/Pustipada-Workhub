import { PriorityBadge, StatusBadge } from '../../Badges'
import {
  CellMeta,
  CellMono,
  CellStack,
  CellTitle,
  DataTable,
  type DataColumn,
} from '../../DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../PageState'
import { Pagination } from '../../Pagination'
import { routePaths } from '../../../hooks/useHashRoute'
import { formatDate, formatDateTime } from '../../../lib/format'
import type { Paginated, Task } from '../../../types/api'

interface TaskHistoryTableProps {
  data: Paginated<Task> | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onPageChange: (page: number) => void
}

export function TaskHistoryTable({
  data,
  loading,
  error,
  onRetry,
  onPageChange,
}: TaskHistoryTableProps) {
  const columns: Array<DataColumn<Task>> = [
    {
      key: 'title',
      header: 'Tugas',
      render: (task) => (
        <CellStack>
          <CellTitle href={`#${routePaths.task(task.id)}`}>
            {task.title}
          </CellTitle>
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
      render: (task) => <CellMono>{formatDate(task.due_date)}</CellMono>,
    },
    {
      key: 'archived',
      header: 'Selesai / Batal',
      align: 'right',
      render: (task) => (
        <CellMono>
          {formatDateTime(
            task.completed_at ??
              (task.status === 'cancelled' ? task.updated_at : null),
          )}
        </CellMono>
      ),
    },
  ]

  if (loading) {
    return <LoadingState label="Memuat riwayat tugas..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if ((data?.data.length ?? 0) === 0) {
    return (
      <EmptyState
        title="Belum ada tugas"
        description="Tidak ada tugas yang cocok dengan filter ini."
      />
    )
  }

  return (
    <>
      <DataTable
        label="Riwayat seluruh tugas"
        rows={data?.data ?? []}
        columns={columns}
        getRowKey={(task) => task.id}
      />
      {data ? (
        <Pagination meta={data.meta} onPageChange={onPageChange} />
      ) : null}
    </>
  )
}
