import type { CalendarResponse } from '../types/api'
import { apiFetch, toQueryString } from './client'

export function getCalendar(month?: string): Promise<CalendarResponse> {
  return apiFetch<CalendarResponse>(`/calendar${toQueryString({ month })}`)
}
