export type UserRole = 'admin' | 'pimpinan' | 'anggota'

export type TaskStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'in_review'
  | 'revision_needed'
  | 'completed'
  | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskActivityAction = 'created' | 'status_changed'

export interface Division {
  id: number
  name: string
  code: string
  description: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  is_active: boolean
  division_id: number | null
  division?: Division | null
  created_at: string | null
  updated_at: string | null
}

export interface TaskActivity {
  id: number
  action: TaskActivityAction
  from_status: TaskStatus | null
  to_status: TaskStatus | null
  note: string | null
  user: User | null
  created_at: string | null
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  status_label: string
  priority: TaskPriority
  division_id: number
  division: Division
  creator: User
  pic: User | null
  members: User[]
  due_date: string | null
  completed_at: string | null
  activities?: TaskActivity[]
  created_at: string | null
  updated_at: string | null
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedMeta {
  current_page: number
  from: number | null
  last_page: number
  links: PaginationLink[]
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface Paginated<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: PaginatedMeta
}

export interface Collection<T> {
  data: T[]
}

export interface Resource<T> {
  data: T
}

export interface ApiErrorPayload {
  message: string
  errors?: Record<string, string[]>
}

export interface LoginResponse {
  token: string
  token_type: 'Bearer'
  user: User
}

export interface MessageResponse {
  message: string
}

export interface TaskListParams {
  status?: TaskStatus
  division_id?: number
  pic_id?: number
  search?: string
  page?: number
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  priority?: TaskPriority
  division_id: number
  pic_id?: number | null
  member_ids?: number[]
  due_date?: string | null
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export interface TransitionTaskInput {
  status: TaskStatus
  note?: string | null
}

export interface UserListParams {
  role?: UserRole
  division_id?: number
  search?: string
  page?: number
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  division_id?: number | null
  is_active?: boolean
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string | null
  role?: UserRole
  division_id?: number | null
  is_active?: boolean
}

export interface CreateDivisionInput {
  name: string
  code: string
  description?: string | null
  is_active?: boolean
}

export type UpdateDivisionInput = Partial<CreateDivisionInput>
