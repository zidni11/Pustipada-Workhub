import type {
  Collection,
  CreateDivisionInput,
  Division,
  PublicDivision,
  Resource,
  UpdateDivisionInput,
} from '../types/api'
import { apiFetch } from './client'

export function listDivisions(): Promise<Collection<Division>> {
  return apiFetch<Collection<Division>>('/divisions')
}

export function listPublicDivisions(): Promise<Collection<PublicDivision>> {
  return apiFetch<Collection<PublicDivision>>('/divisions/public', { auth: false })
}

export function createDivision(input: CreateDivisionInput): Promise<Resource<Division>> {
  return apiFetch<Resource<Division>>('/divisions', { method: 'POST', body: input })
}

export function updateDivision(
  id: number,
  input: UpdateDivisionInput,
): Promise<Resource<Division>> {
  return apiFetch<Resource<Division>>(`/divisions/${id}`, { method: 'PATCH', body: input })
}

export function deleteDivision(id: number): Promise<void> {
  return apiFetch<void>(`/divisions/${id}`, { method: 'DELETE' })
}
