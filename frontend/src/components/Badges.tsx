import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../lib/tasks'
import type { TaskPriority, TaskStatus, UserRole } from '../types/api'
import { Badge, type BadgeTone } from './ui/Badge'

const STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  draft: 'neutral',
  open: 'info',
  in_progress: 'warning',
  in_review: 'info',
  revision_needed: 'danger',
  completed: 'success',
  cancelled: 'neutral',
}

const PRIORITY_TONES: Record<TaskPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
}

const ROLE_TONES: Record<UserRole, BadgeTone> = {
  admin: 'info',
  pimpinan: 'success',
  anggota: 'neutral',
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  pimpinan: 'Pimpinan',
  anggota: 'Anggota',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{TASK_STATUS_LABELS[status]}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={PRIORITY_TONES[priority]}>{TASK_PRIORITY_LABELS[priority]}</Badge>
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</Badge>
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Aktif' : 'Nonaktif'}</Badge>
}

export function UserStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? 'success' : 'warning'}>
      {active ? 'Aktif' : 'Menunggu Aktivasi / Nonaktif'}
    </Badge>
  )
}
