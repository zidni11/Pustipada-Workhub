import type {
  Collection,
  CommunityEvent,
  CreateCommunityEventInput,
  Resource,
  UpdateCommunityEventInput,
} from '../types/api'
import { apiFetch, toQueryString } from './client'

export function listEvents(params: { month?: string } = {}): Promise<Collection<CommunityEvent>> {
  return apiFetch<Collection<CommunityEvent>>(`/events${toQueryString(params)}`)
}

export function createEvent(
  input: CreateCommunityEventInput,
): Promise<Resource<CommunityEvent>> {
  return apiFetch<Resource<CommunityEvent>>('/events', {
    method: 'POST',
    body: input,
  })
}

export function updateEvent(
  id: number,
  input: UpdateCommunityEventInput,
): Promise<Resource<CommunityEvent>> {
  return apiFetch<Resource<CommunityEvent>>(`/events/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteEvent(id: number): Promise<void> {
  return apiFetch<void>(`/events/${id}`, { method: 'DELETE' })
}
