import type { CalendarTask, CommunityEvent } from '../types/api'

export const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export interface CalendarDay {
  key: string
  date: Date
  inMonth: boolean
  isToday: boolean
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + offset, 1)

  return currentMonthKey(date)
}

export function calendarDays(month: string): CalendarDay[] {
  const [year, monthNumber] = month.split('-').map(Number)
  const first = new Date(year, monthNumber - 1, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, monthNumber - 1, 1 - offset)
  const todayKey = dateKey(new Date())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    )
    const key = dateKey(date)

    return {
      key,
      date,
      inMonth: date.getMonth() === monthNumber - 1,
      isToday: key === todayKey,
    }
  })
}

export function dateKey(value: string | Date): string {
  const date = value instanceof Date ? value : parseDate(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function tasksForDay(tasks: CalendarTask[], day: string): CalendarTask[] {
  return tasks.filter((task) => task.due_date === day)
}

export function eventsForDay(
  events: CommunityEvent[],
  day: string,
): CommunityEvent[] {
  return events.filter((event) => {
    const start = dateKey(event.start_at)
    const end = event.end_at ? dateKey(event.end_at) : start

    return day >= start && day <= end
  })
}

function parseDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    )
  }

  return new Date(value)
}
