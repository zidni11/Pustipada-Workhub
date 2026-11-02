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

export type TaskSubmissionType = 'file' | 'link'

export interface TaskSubmission {
  id: number
  task_id: number
  type: TaskSubmissionType
  type_label: string
  title: string
  url: string | null
  file_url: string | null
  original_name: string | null
  mime_type: string | null
  file_size: number | null
  user?: User
  created_at: string | null
}

export interface TaskChecklist {
  id: number
  task_id: number
  title: string
  is_completed: boolean
  completed_by?: User | null
  completed_at: string | null
  created_at: string | null
}

export interface ChecklistProgress {
  total: number
  completed: number
  percentage: number
}

export type CommunityEventCategory = string

export interface EventCategoryOption {
  value: string
  label: string
}

export interface CommunityEvent {
  id: number
  title: string
  description: string | null
  category: CommunityEventCategory
  category_label: string
  location: string | null
  start_at: string
  end_at: string | null
  division_id: number | null
  division?: Division | null
  creator?: User | null
  created_at: string | null
  updated_at: string | null
}

export interface CalendarTask {
  id: number
  title: string
  status: TaskStatus
  status_label: string
  priority: TaskPriority
  due_date: string | null
  division?: Division
  pic?: User | null
  target_url: string
}

export interface CalendarReminder {
  type: 'task' | 'event'
  id: number
  title: string
  date: string | null
  label: string
  target_url: string
}

export interface CalendarResponse {
  month: string
  tasks: CalendarTask[]
  events: CommunityEvent[]
  upcoming_reminders: CalendarReminder[]
}

export type NotificationType =
  | 'task_assigned'
  | 'task_status_changed'
  | 'event_created'
  | 'account_approved'

export interface UserNotification {
  id: number
  type: NotificationType
  title: string
  message: string
  target_url: string | null
  read_at: string | null
  created_at: string | null
}

export interface NotificationListResponse {
  data: UserNotification[]
  unread_count: number
}

export interface Division {
  id: number
  name: string
  code: string
  description: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface PublicDivision {
  id: number
  name: string
  code: string
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
  submissions?: TaskSubmission[]
  checklists?: TaskChecklist[]
  checklist_progress?: ChecklistProgress
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

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
  division_id: number
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
  per_page?: number
  view_mode?: 'active' | 'history' | 'all'
  assignment_role?: 'pic' | 'supporting'
  date_field?: 'activity' | 'created_at'
  date_from?: string
  date_to?: string
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

export interface CreateTaskSubmissionInput {
  type: TaskSubmissionType
  title: string
  url?: string
  file?: File
}

export interface CreateCommunityEventInput {
  title: string
  description?: string | null
  category: CommunityEventCategory
  location?: string | null
  start_at: string
  end_at?: string | null
  division_id?: number | null
}

export type UpdateCommunityEventInput = Partial<CreateCommunityEventInput>

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
