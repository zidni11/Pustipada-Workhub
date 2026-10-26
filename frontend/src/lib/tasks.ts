import type { Task, TaskPriority, TaskStatus, User } from '../types/api'

export const TASK_STATUS_ORDER: TaskStatus[] = [
  'draft',
  'open',
  'in_progress',
  'in_review',
  'revision_needed',
  'completed',
  'cancelled',
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  in_progress: 'In Progress',
  in_review: 'In Review',
  revision_needed: 'Revision Needed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
}

export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  draft: ['open', 'cancelled'],
  open: ['in_progress', 'cancelled'],
  in_progress: ['in_review', 'cancelled'],
  in_review: ['completed', 'revision_needed', 'cancelled'],
  revision_needed: ['in_progress', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUS_ORDER.includes(value as TaskStatus)
}

export function isAssignedTo(task: Task, user: User): boolean {
  if (task.pic?.id === user.id) {
    return true
  }

  return (task.members ?? []).some((member) => member.id === user.id)
}

export function allowedTransitionsFor(task: Task, user: User): TaskStatus[] {
  const transitions = TASK_TRANSITIONS[task.status]

  if (user.role === 'pimpinan') {
    return transitions
  }

  if (user.role !== 'anggota' || !isAssignedTo(task, user)) {
    return []
  }

  return transitions.filter(
    (status) => status === 'in_progress' || status === 'in_review',
  )
}

export function transitionLabel(from: TaskStatus, to: TaskStatus): string {
  switch (to) {
    case 'open':
      return 'Publikasikan'
    case 'in_progress':
      return from === 'revision_needed' ? 'Lanjutkan Pekerjaan' : 'Mulai Kerjakan'
    case 'in_review':
      return 'Ajukan Review'
    case 'completed':
      return 'Setujui & Selesaikan'
    case 'revision_needed':
      return 'Minta Revisi'
    case 'cancelled':
      return 'Batalkan Tugas'
    default:
      return TASK_STATUS_LABELS[to]
  }
}

export function canManageTasks(user: User): boolean {
  return user.role === 'pimpinan'
}

export function canManageMasterData(user: User): boolean {
  return user.role === 'admin'
}
