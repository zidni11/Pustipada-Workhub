import type {
  Collection,
  CreateDivisionInput,
  Division,
  Resource,
  UpdateDivisionInput,
} from '../types/api'
import { apiFetch } from './client'

export function listDivisions(): Promise<Collection<Division>> {
  return apiFetch<Collection<Division>>('/divisions')
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
