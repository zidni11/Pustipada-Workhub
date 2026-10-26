import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../lib/tasks'
import type { TaskPriority, TaskStatus, UserRole } from '../types/api'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge status-badge status-${status}`}>{TASK_STATUS_LABELS[status]}</span>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`badge priority-badge priority-${priority}`}>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  )
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  pimpinan: 'Pimpinan',
  anggota: 'Anggota',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={`badge role-badge role-${role}`}>{ROLE_LABELS[role]}</span>
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`badge active-badge ${active ? 'is-active' : 'is-inactive'}`}>
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}
