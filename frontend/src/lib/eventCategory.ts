import type { EventCategoryOption } from '../types/api'

const EVENT_CATEGORY_TONES = 8

export const DEFAULT_EVENT_CATEGORIES: EventCategoryOption[] = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'lunch', label: 'Lunch break' },
  { value: 'celebration', label: 'Acara perayaan' },
  { value: 'pengumuman', label: 'Pengumuman' },
  { value: 'kegiatan_kantor', label: 'Kegiatan Kantor' },
  { value: 'other', label: 'Lainnya' },
]

export interface EventCategoryColors {
  color: string
  background: string
}

export function eventCategoryTone(category: string): number {
  const normalized = category.trim().toLowerCase()
  let hash = 0

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0
  }

  return (hash % EVENT_CATEGORY_TONES) + 1
}

export function eventCategoryColors(category: string): EventCategoryColors {
  const tone = eventCategoryTone(category)

  return {
    color: `var(--event-cat-${tone}-fg)`,
    background: `var(--event-cat-${tone}-bg)`,
  }
}
