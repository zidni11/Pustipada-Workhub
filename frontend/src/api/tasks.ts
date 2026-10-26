import type {
  CreateTaskInput,
  Paginated,
  Resource,
  Task,
  TaskListParams,
  TaskStatus,
  TransitionTaskInput,
  UpdateTaskInput,
} from '../types/api'
import { apiFetch, toQueryString } from './client'

const TASK_STATUSES: TaskStatus[] = [
  'draft',
  'open',
  'in_progress',
  'in_review',
  'revision_needed',
  'completed',
  'cancelled',
]

export interface TaskSummary {
  total: number
  counts: Record<TaskStatus, number>
}

export function listTasks(params: TaskListParams = {}): Promise<Paginated<Task>> {
  return apiFetch<Paginated<Task>>(`/tasks${toQueryString(params)}`)
}

export function getTask(id: number): Promise<Resource<Task>> {
  return apiFetch<Resource<Task>>(`/tasks/${id}`)
}

export function createTask(input: CreateTaskInput): Promise<Resource<Task>> {
  return apiFetch<Resource<Task>>('/tasks', { method: 'POST', body: input })
}

export function updateTask(id: number, input: UpdateTaskInput): Promise<Resource<Task>> {
  return apiFetch<Resource<Task>>(`/tasks/${id}`, { method: 'PATCH', body: input })
}

export function deleteTask(id: number): Promise<void> {
  return apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' })
}

export function transitionTask(id: number, input: TransitionTaskInput): Promise<Resource<Task>> {
  return apiFetch<Resource<Task>>(`/tasks/${id}/status`, { method: 'PATCH', body: input })
}

export async function getTaskSummary(): Promise<TaskSummary> {
  const entries = await Promise.all(
    TASK_STATUSES.map(async (status) => {
      const response = await listTasks({ status })

      return [status, response.meta.total] as const
    }),
  )

  const counts = Object.fromEntries(entries) as Record<TaskStatus, number>
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)

  return { total, counts }
}
