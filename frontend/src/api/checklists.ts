import type { Resource, TaskChecklist } from '../types/api'
import { apiFetch } from './client'

export function createTaskChecklist(
  taskId: number,
  title: string,
): Promise<Resource<TaskChecklist>> {
  return apiFetch<Resource<TaskChecklist>>(`/tasks/${taskId}/checklists`, {
    method: 'POST',
    body: { title },
  })
}

export function toggleTaskChecklist(
  taskId: number,
  checklistId: number,
): Promise<Resource<TaskChecklist>> {
  return apiFetch<Resource<TaskChecklist>>(
    `/tasks/${taskId}/checklists/${checklistId}`,
    { method: 'PATCH' },
  )
}

export function deleteTaskChecklist(
  taskId: number,
  checklistId: number,
): Promise<void> {
  return apiFetch<void>(`/tasks/${taskId}/checklists/${checklistId}`, {
    method: 'DELETE',
  })
}
