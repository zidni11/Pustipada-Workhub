import { useState } from 'react'
import { getCalendar } from '../api/calendar'
import { getErrorMessage } from '../api/client'
import { listDivisions } from '../api/divisions'
import { deleteEvent, listEventCategories } from '../api/events'
import { PageHeader } from '../components/PageHeader'
import { ErrorState, LoadingState } from '../components/PageState'
import { CalendarAgenda } from '../components/calendar/CalendarAgenda'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { EventFormModal } from '../components/EventFormModal'
import { ArrowLeftIcon } from '../components/ui/Arrows'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Notice } from '../components/ui/Notice'
import { Surface } from '../components/ui/Surface'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { navigate, routePaths } from '../hooks/useHashRoute'
import {
  currentMonthKey,
  dateKey,
  shiftMonth,
} from '../lib/calendar'
import {
  DEFAULT_EVENT_CATEGORIES,
  eventCategoryColors,
} from '../lib/eventCategory'
import { formatMonth } from '../lib/format'
import type { CommunityEvent } from '../types/api'
import styles from './CalendarPage.module.css'

interface CalendarPageProps {
  month?: string
  create?: boolean
}

export function CalendarPage({ month: routeMonth, create }: CalendarPageProps) {
  const { user } = useAuth()
  const month = routeMonth ?? currentMonthKey()
  const [selectedDay, setSelectedDay] = useState(() =>
    defaultDayForMonth(month),
  )
  const [editing, setEditing] = useState<{
    event: CommunityEvent | null
  } | null>(
    create && (user?.role === 'admin' || user?.role === 'pimpinan')
      ? { event: null }
      : null,
  )
  const [deleting, setDeleting] = useState<CommunityEvent | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const canManage = user?.role === 'admin' || user?.role === 'pimpinan'

  const calendar = useAsync(() => getCalendar(month), [month])
  const divisions = useAsync(
    () => (canManage ? listDivisions() : Promise.resolve({ data: [] })),
    [canManage],
  )
  const eventCategories = useAsync(
    () => (canManage ? listEventCategories() : Promise.resolve({ data: [] })),
    [canManage],
  )

  if (!user) {
    return null
  }

  const closeForm = () => {
    setEditing(null)

    if (create) {
      navigate(routePaths.calendarMonth(month))
    }
  }

  const handleSaved = (event: CommunityEvent) => {
    setEditing(null)
    setSelectedDay(dateKey(event.start_at))
    calendar.reload()
    navigate(routePaths.calendarMonth(dateKey(event.start_at).slice(0, 7)))
  }

  const handleDelete = async () => {
    if (!deleting) return

    setDeleteBusy(true)
    setActionError(null)

    try {
      await deleteEvent(deleting.id)
      setDeleting(null)
      calendar.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
      setDeleting(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  const goToMonth = (next: string) => {
    navigate(routePaths.calendarMonth(next))
  }

  const data = calendar.data
  const legendCategories = data
    ? Array.from(
        new Map(
          data.events.map((event) => [
            event.category_label.toLowerCase(),
            event.category_label,
          ]),
        ).values(),
      )
    : []

  return (
    <>
      <PageHeader
        title="Kalender"
        description="Tenggat tugas, acara komunitas, dan pengingat dalam satu tampilan."
        actions={
          canManage ? (
            <Button onClick={() => setEditing({ event: null })}>
              Acara Baru
            </Button>
          ) : (
            <ButtonLink href={routePaths.tasks} variant="secondary">
              Lihat Tugas
            </ButtonLink>
          )
        }
      />

      {actionError ? (
        <Notice className={styles.notice}>{actionError}</Notice>
      ) : null}

      <Surface padding="none" className={styles.toolbar}>
        <div className={styles.monthNav}>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Bulan sebelumnya"
            onClick={() => goToMonth(shiftMonth(month, -1))}
          >
            <ArrowLeftIcon />
          </Button>
          <h2 className={styles.monthLabel} aria-live="polite">
            {formatMonth(month)}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Bulan berikutnya"
            onClick={() => goToMonth(shiftMonth(month, 1))}
          >
            <span className={styles.flip}>
              <ArrowLeftIcon />
            </span>
          </Button>
        </div>

        <div className={styles.toolbarMeta}>
          <button
            type="button"
            className={styles.todayButton}
            onClick={() => {
              const today = currentMonthKey()
              navigate(routePaths.calendarMonth(today))
              setSelectedDay(dateKey(new Date()))
            }}
          >
            Hari ini
          </button>
          <div className={styles.legend} aria-label="Legenda kategori acara">
            {legendCategories.map((category) => (
              <span key={category}>
                <i
                  className={styles.dot}
                  style={{ background: eventCategoryColors(category).color }}
                  aria-hidden="true"
                />
                {category}
              </span>
            ))}
            <span>
              <i
                className={`${styles.dot} ${styles.dotTask}`}
                aria-hidden="true"
              />
              Tenggat
            </span>
          </div>
        </div>
      </Surface>

      {calendar.loading ? (
        <Surface padding="none">
          <LoadingState label="Memuat kalender..." />
        </Surface>
      ) : calendar.error ? (
        <Surface padding="none">
          <ErrorState message={calendar.error} onRetry={calendar.reload} />
        </Surface>
      ) : data ? (
        <>
          <Surface padding="none" className={styles.gridSurface}>
            <CalendarGrid
              month={month}
              tasks={data.tasks}
              events={data.events}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </Surface>

          <CalendarAgenda
            selectedDay={selectedDay}
            tasks={data.tasks}
            events={data.events}
            reminders={data.upcoming_reminders}
            canManageEvents={canManage}
            onEditEvent={(event) => setEditing({ event })}
            onDeleteEvent={setDeleting}
          />
        </>
      ) : null}

      {editing ? (
        <EventFormModal
          event={editing.event ?? undefined}
          divisions={divisions.data?.data ?? []}
          categories={eventCategories.data?.data ?? DEFAULT_EVENT_CATEGORIES}
          defaultDivisionId={user.division_id}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Hapus acara?"
          message={`Acara ${deleting.title} akan dihapus dari kalender. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus acara"
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </>
  )
}

function defaultDayForMonth(month: string): string {
  const today = new Date()
  const todayMonth = currentMonthKey(today)

  return todayMonth === month ? dateKey(today) : `${month}-01`
}
