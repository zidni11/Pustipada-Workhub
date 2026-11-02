import type { CreateTaskSubmissionInput, Resource, TaskSubmission } from '../types/api'
import { apiFetch } from './client'

export function createTaskSubmission(
  taskId: number,
  input: CreateTaskSubmissionInput,
): Promise<Resource<TaskSubmission>> {
  const body = new FormData()

  body.set('type', input.type)
  body.set('title', input.title)

  if (input.type === 'link' && input.url) {
    body.set('url', input.url)
  }

  if (input.type === 'file' && input.file) {
    body.set('file', input.file)
  }

  return apiFetch<Resource<TaskSubmission>>(`/tasks/${taskId}/submissions`, {
    method: 'POST',
    body,
  })
}

export function deleteTaskSubmission(
  taskId: number,
  submissionId: number,
): Promise<void> {
  return apiFetch<void>(`/tasks/${taskId}/submissions/${submissionId}`, {
    method: 'DELETE',
  })
}
