import { ListToolbar } from '../../ListToolbar'
import { Button } from '../../ui/Button'
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from '../../../lib/tasks'
import type {
  Division,
  TaskStatus,
  User,
} from '../../../types/api'
import type { AssignmentRole } from '../../../composables/useTaskHistory'
import styles from './TaskHistoryFilters.module.css'

interface TaskHistoryFiltersProps {
  query: string
  onQueryChange: (value: string) => void
  onSearch: () => void
  status: TaskStatus | ''
  onStatusChange: (value: TaskStatus | '') => void
  divisions: Division[]
  divisionId: string
  onDivisionChange: (value: string) => void
  users: User[]
  canManagePic: boolean
  picId: string
  onPicChange: (value: string) => void
  showAssignmentRole: boolean
  assignmentRole: AssignmentRole
  onAssignmentRoleChange: (value: AssignmentRole) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  activeFilterCount: number
  onReset: () => void
}

export function TaskHistoryFilters({
  query,
  onQueryChange,
  onSearch,
  status,
  onStatusChange,
  divisions,
  divisionId,
  onDivisionChange,
  users,
  canManagePic,
  picId,
  onPicChange,
  showAssignmentRole,
  assignmentRole,
  onAssignmentRoleChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  activeFilterCount,
  onReset,
}: TaskHistoryFiltersProps) {
  return (
    <ListToolbar
      query={query}
      onQueryChange={onQueryChange}
      onSearch={onSearch}
      placeholder="Cari judul atau deskripsi tugas..."
      searchLabel="Cari riwayat tugas"
      filters={
        <div className={styles.filters}>
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as TaskStatus | '')
            }
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
            onChange={(event) => onDivisionChange(event.target.value)}
            aria-label="Filter divisi"
          >
            <option value="">Semua divisi</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
          </select>

          {canManagePic ? (
            <select
              value={picId}
              onChange={(event) => onPicChange(event.target.value)}
              aria-label="Filter PIC"
            >
              <option value="">Semua PIC</option>
              {users
                .filter((member) => member.is_active)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          ) : null}

          {showAssignmentRole ? (
            <select
              value={assignmentRole}
              onChange={(event) =>
                onAssignmentRoleChange(event.target.value as AssignmentRole)
              }
              aria-label="Filter peran saya"
            >
              <option value="">Semua peran saya</option>
              <option value="pic">Sebagai PIC</option>
              <option value="supporting">Sebagai pendukung</option>
            </select>
          ) : null}

          <label className={styles.dateField}>
            <span>Dibuat dari</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              aria-label="Tanggal dibuat mulai"
            />
          </label>

          <label className={styles.dateField}>
            <span>Sampai</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              aria-label="Tanggal dibuat akhir"
            />
          </label>

          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset ({activeFilterCount})
            </Button>
          ) : null}
        </div>
      }
    />
  )
}
