import { StatusBadge } from '../Badges'
import { EmptyState } from '../PageState'
import { Button } from '../ui/Button'
import { ButtonLink } from '../ui/ButtonLink'
import { Surface } from '../ui/Surface'
import {
  eventsForDay,
  tasksForDay,
} from '../../lib/calendar'
import { eventCategoryColors } from '../../lib/eventCategory'
import {
  formatDate,
  formatTime,
  formatWeekday,
} from '../../lib/format'
import type {
  CalendarReminder,
  CalendarTask,
  CommunityEvent,
} from '../../types/api'
import styles from './CalendarAgenda.module.css'

interface CalendarAgendaProps {
  selectedDay: string
  tasks: CalendarTask[]
  events: CommunityEvent[]
  reminders: CalendarReminder[]
  canManageEvents: boolean
  onEditEvent: (event: CommunityEvent) => void
  onDeleteEvent: (event: CommunityEvent) => void
}

export function CalendarAgenda({
  selectedDay,
  tasks,
  events,
  reminders,
  canManageEvents,
  onEditEvent,
  onDeleteEvent,
}: CalendarAgendaProps) {
  const dayTasks = tasksForDay(tasks, selectedDay)
  const dayEvents = eventsForDay(events, selectedDay)
  const hasItems = dayTasks.length > 0 || dayEvents.length > 0

  return (
    <div className={styles.layout}>
      <Surface padding="none">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Agenda</p>
            <h2 className={styles.title}>{formatWeekday(selectedDay)}</h2>
          </div>
          <span className={styles.count}>
            {dayEvents.length + dayTasks.length} item
          </span>
        </header>

        {!hasItems ? (
          <EmptyState
            title="Tidak ada agenda"
            description="Tidak ada acara atau tenggat tugas pada hari ini."
          />
        ) : (
          <div className={styles.body}>
            {dayEvents.length > 0 ? (
              <section aria-labelledby="agenda-events">
                <h3 className={styles.sectionTitle} id="agenda-events">
                  Acara
                </h3>
                <ul className={styles.list}>
                  {dayEvents.map((event) => (
                    <li key={event.id} className={styles.eventItem}>
                      <span
                        className={styles.categoryDot}
                        style={{
                          background: eventCategoryColors(event.category_label)
                            .color,
                        }}
                        aria-hidden="true"
                      />
                      <div className={styles.itemBody}>
                        <strong className={styles.itemTitle}>{event.title}</strong>
                        <span className={styles.meta}>
                          {formatTime(event.start_at)}
                          {event.end_at ? `–${formatTime(event.end_at)}` : ''}
                          {' · '}
                          {event.category_label}
                          {event.division ? ` · ${event.division.name}` : ''}
                        </span>
                        {event.location ? (
                          <span className={styles.location}>{event.location}</span>
                        ) : null}
                        {event.description ? (
                          <p className={styles.description}>{event.description}</p>
                        ) : null}
                      </div>
                      {canManageEvents ? (
                        <div className={styles.eventActions}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditEvent(event)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteEvent(event)}
                          >
                            Hapus
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {dayTasks.length > 0 ? (
              <section aria-labelledby="agenda-tasks">
                <h3 className={styles.sectionTitle} id="agenda-tasks">
                  Tenggat tugas
                </h3>
                <ul className={styles.list}>
                  {dayTasks.map((task) => (
                    <li key={task.id} className={styles.taskItem}>
                      <div className={styles.itemBody}>
                        <ButtonLink
                          href={task.target_url}
                          variant="ghost"
                          size="sm"
                          className={styles.taskLink}
                        >
                          {task.title}
                        </ButtonLink>
                        <span className={styles.meta}>
                          {task.division?.name ?? 'Tanpa divisi'}
                          {task.pic ? ` · ${task.pic.name}` : ''}
                        </span>
                      </div>
                      <StatusBadge status={task.status} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </Surface>

      <Surface padding="none">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>7 hari ke depan</p>
            <h2 className={styles.title}>Pengingat</h2>
          </div>
        </header>
        {reminders.length === 0 ? (
          <p className={styles.emptyReminder}>Belum ada pengingat mendatang.</p>
        ) : (
          <ul className={styles.reminderList}>
            {reminders.map((reminder) => (
              <li key={`${reminder.type}-${reminder.id}`}>
                <a className={styles.reminder} href={reminder.target_url}>
                  <span className={styles.reminderDate}>
                    {formatDate(reminder.date)}
                  </span>
                  <span className={styles.reminderBody}>
                    <strong>{reminder.title}</strong>
                    <span>
                      {reminder.type === 'task' ? 'Tenggat' : 'Acara'} ·{' '}
                      {reminder.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  )
}
