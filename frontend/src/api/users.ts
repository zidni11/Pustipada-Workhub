import type {
  CreateUserInput,
  Paginated,
  Resource,
  UpdateUserInput,
  User,
  UserListParams,
} from '../types/api'
import { apiFetch, toQueryString } from './client'

const MAX_PAGES = 50

export function listUsers(params: UserListParams = {}): Promise<Paginated<User>> {
  return apiFetch<Paginated<User>>(`/users${toQueryString(params)}`)
}

export async function listAllUsers(
  params: Omit<UserListParams, 'page'> = {},
): Promise<User[]> {
  const users: User[] = []
  let page = 1
  let lastPage = 1

  do {
    const response = await listUsers({ ...params, page })

    users.push(...response.data)
    lastPage = response.meta.last_page
    page += 1
  } while (page <= lastPage && page <= MAX_PAGES)

  return users
}

export function getUser(id: number): Promise<Resource<User>> {
  return apiFetch<Resource<User>>(`/users/${id}`)
}

export function createUser(input: CreateUserInput): Promise<Resource<User>> {
  return apiFetch<Resource<User>>('/users', { method: 'POST', body: input })
}

export function updateUser(id: number, input: UpdateUserInput): Promise<Resource<User>> {
  return apiFetch<Resource<User>>(`/users/${id}`, { method: 'PATCH', body: input })
}

export function deleteUser(id: number): Promise<void> {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' })
}
