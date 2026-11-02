import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '../api/client'
import { createEvent, updateEvent } from '../api/events'
import { DEFAULT_EVENT_CATEGORIES } from '../lib/eventCategory'
import type {
  CommunityEvent,
  CommunityEventCategory,
  CreateCommunityEventInput,
  Division,
  EventCategoryOption,
} from '../types/api'
import { FormField } from './FormField'
import { Modal } from './Modal'
import { Button } from './ui/Button'
import { FormRow, FormStack } from './ui/FormLayout'
import { Notice } from './ui/Notice'

const CUSTOM_CATEGORY_VALUE = '__custom__'

interface EventFormModalProps {
  event?: CommunityEvent
  divisions: Division[]
  categories?: EventCategoryOption[]
  defaultDivisionId?: number | null
  onClose: () => void
  onSaved: (event: CommunityEvent) => void
}

export function EventFormModal({
  event,
  divisions,
  categories = DEFAULT_EVENT_CATEGORIES,
  defaultDivisionId,
  onClose,
  onSaved,
}: EventFormModalProps) {
  const start = splitDateTime(event?.start_at)
  const end = splitDateTime(event?.end_at)
  const initialCategory = event?.category ?? 'meeting'
  const initialCustomMode =
    event?.category !== undefined
    && !categories.some((option) => option.value === event.category)

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [category, setCategory] = useState<CommunityEventCategory>(initialCategory)
  const [customCategory, setCustomCategory] = useState(
    initialCustomMode ? initialCategory : '',
  )
  const [customMode, setCustomMode] = useState(initialCustomMode)
  const [location, setLocation] = useState(event?.location ?? '')
  const [divisionId, setDivisionId] = useState(
    event
      ? event.division_id
        ? String(event.division_id)
        : ''
      : defaultDivisionId
        ? String(defaultDivisionId)
        : '',
  )
  const [startDate, setStartDate] = useState(start.date)
  const [startTime, setStartTime] = useState(start.time)
  const [endDate, setEndDate] = useState(end.date)
  const [endTime, setEndTime] = useState(end.time)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const categoryOptions = [...categories]

  if (
    event
    && !categoryOptions.some((option) => option.value === event.category)
  ) {
    categoryOptions.push({
      value: event.category,
      label: event.category_label,
    })
  }

  const resolvedCategory = customMode ? customCategory.trim() : category

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    const nextErrors: Record<string, string[]> = {}

    if (!title.trim()) {
      nextErrors.title = ['Judul acara wajib diisi.']
    }

    if (!resolvedCategory) {
      nextErrors.category = ['Kategori wajib dipilih atau diisi.']
    } else if (resolvedCategory.length > 60) {
      nextErrors.category = ['Nama kategori maksimal 60 karakter.']
    }

    if (!startDate || !startTime) {
      nextErrors.start_at = ['Tanggal dan waktu mulai wajib diisi.']
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    const startAt = new Date(`${startDate}T${startTime}`)
    const endAt =
      endDate && endTime ? new Date(`${endDate}T${endTime}`) : null

    if (endAt && endAt.getTime() < startAt.getTime()) {
      setFieldErrors({
        end_at: ['Waktu selesai tidak boleh lebih awal dari waktu mulai.'],
      })
      return
    }

    const payload: CreateCommunityEventInput = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      category: resolvedCategory,
      location: location.trim() ? location.trim() : null,
      start_at: startAt.toISOString(),
      end_at: endAt ? endAt.toISOString() : null,
      division_id: divisionId ? Number(divisionId) : null,
    }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    try {
      const response = event
        ? await updateEvent(event.id, payload)
        : await createEvent(payload)

      onSaved(response.data)
    } catch (err) {
      setError(getErrorMessage(err))

      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={event ? 'Edit Acara' : 'Acara Baru'}
      subtitle={
        event
          ? 'Perbarui jadwal atau detail acara.'
          : 'Tambahkan agenda untuk seluruh tim atau divisi.'
      }
      onClose={saving ? () => undefined : onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="event-form" loading={saving}>
            Simpan Acara
          </Button>
        </>
      }
    >
      <FormStack id="event-form" onSubmit={handleSubmit}>
        {error ? <Notice>{error}</Notice> : null}

        <FormField label="Judul" htmlFor="event-title" error={fieldErrors.title?.[0]}>
          <input
            id="event-title"
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            placeholder="Contoh: Rapat koordinasi bulanan"
            maxLength={255}
            required
          />
        </FormField>

        <FormRow>
          <FormField
            label="Kategori"
            htmlFor="event-category"
            hint="Pilih kategori yang sudah ada atau buat kategori baru."
            error={customMode ? undefined : fieldErrors.category?.[0]}
          >
            <select
              id="event-category"
              value={customMode ? CUSTOM_CATEGORY_VALUE : category}
              onChange={(changeEvent) => {
                const value = changeEvent.target.value

                if (value === CUSTOM_CATEGORY_VALUE) {
                  setCustomMode(true)
                  return
                }

                setCustomMode(false)
                setCategory(value)
              }}
            >
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
              <option value={CUSTOM_CATEGORY_VALUE}>
                + Buat Kategori Baru (Kustom)
              </option>
            </select>
          </FormField>

          <FormField
            label="Divisi"
            htmlFor="event-division"
            hint="Kosongkan untuk acara seluruh organisasi."
            error={fieldErrors.division_id?.[0]}
          >
            <select
              id="event-division"
              value={divisionId}
              onChange={(changeEvent) => setDivisionId(changeEvent.target.value)}
            >
              <option value="">Semua divisi</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </FormField>
        </FormRow>

        {customMode ? (
          <FormField
            label="Nama kategori baru"
            htmlFor="event-category-custom"
            hint="Maksimal 60 karakter."
            error={fieldErrors.category?.[0]}
          >
            <input
              id="event-category-custom"
              value={customCategory}
              onChange={(changeEvent) => setCustomCategory(changeEvent.target.value)}
              placeholder="Ketik nama kategori baru, misal: Workshop / Rapat Koordinasi..."
              maxLength={60}
              autoFocus
              required
            />
          </FormField>
        ) : null}

        <FormRow>
          <FormField
            label="Tanggal mulai"
            htmlFor="event-start-date"
            error={fieldErrors.start_at?.[0]}
          >
            <input
              id="event-start-date"
              type="date"
              value={startDate}
              onChange={(changeEvent) => setStartDate(changeEvent.target.value)}
              required
            />
          </FormField>
          <FormField label="Waktu mulai" htmlFor="event-start-time">
            <input
              id="event-start-time"
              type="time"
              value={startTime}
              onChange={(changeEvent) => setStartTime(changeEvent.target.value)}
              required
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField
            label="Tanggal selesai"
            htmlFor="event-end-date"
            hint="Opsional."
          >
            <input
              id="event-end-date"
              type="date"
              value={endDate}
              onChange={(changeEvent) => setEndDate(changeEvent.target.value)}
            />
          </FormField>
          <FormField
            label="Waktu selesai"
            htmlFor="event-end-time"
            error={fieldErrors.end_at?.[0]}
          >
            <input
              id="event-end-time"
              type="time"
              value={endTime}
              onChange={(changeEvent) => setEndTime(changeEvent.target.value)}
            />
          </FormField>
        </FormRow>

        <FormField
          label="Lokasi"
          htmlFor="event-location"
          error={fieldErrors.location?.[0]}
        >
          <input
            id="event-location"
            value={location}
            onChange={(changeEvent) => setLocation(changeEvent.target.value)}
            placeholder="Ruang rapat, tautan, atau alamat"
            maxLength={255}
          />
        </FormField>

        <FormField
          label="Deskripsi"
          htmlFor="event-description"
          error={fieldErrors.description?.[0]}
        >
          <textarea
            id="event-description"
            value={description}
            onChange={(changeEvent) => setDescription(changeEvent.target.value)}
            rows={3}
            placeholder="Agenda atau catatan tambahan."
          />
        </FormField>
      </FormStack>
    </Modal>
  )
}

function splitDateTime(value: string | null | undefined): {
  date: string
  time: string
} {
  if (!value) {
    return { date: '', time: '09:00' }
  }

  const date = new Date(value)

  return {
    date: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-'),
    time: [
      String(date.getHours()).padStart(2, '0'),
      String(date.getMinutes()).padStart(2, '0'),
    ].join(':'),
  }
}
