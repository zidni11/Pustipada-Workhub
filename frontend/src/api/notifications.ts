import type {
  NotificationListResponse,
  Resource,
  UserNotification,
} from '../types/api'
import { apiFetch } from './client'

export interface MarkAllReadResponse {
  message: string
  updated: number
  unread_count: number
}

export function listNotifications(): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>('/notifications')
}

export function markNotificationRead(id: number): Promise<Resource<UserNotification>> {
  return apiFetch<Resource<UserNotification>>(`/notifications/${id}/read`, {
    method: 'PATCH',
  })
}

export function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  return apiFetch<MarkAllReadResponse>('/notifications/read-all', {
    method: 'POST',
  })
}
