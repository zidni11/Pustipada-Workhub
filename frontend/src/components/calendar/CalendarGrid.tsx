import type { CalendarTask, CommunityEvent } from '../../types/api'
import {
  calendarDays,
  eventsForDay,
  tasksForDay,
  WEEKDAY_LABELS,
} from '../../lib/calendar'
import { cn } from '../../lib/cn'
import { eventCategoryColors } from '../../lib/eventCategory'
import styles from './CalendarGrid.module.css'

interface CalendarGridProps {
  month: string
  tasks: CalendarTask[]
  events: CommunityEvent[]
  selectedDay: string
  onSelectDay: (day: string) => void
}

export function CalendarGrid({
  month,
  tasks,
  events,
  selectedDay,
  onSelectDay,
}: CalendarGridProps) {
  const days = calendarDays(month)

  return (
    <div className={styles.viewport}>
      <div className={styles.calendar} role="grid" aria-label="Kalender bulanan">
        <div className={styles.weekdays} role="row">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className={styles.weekday} role="columnheader">
              {label}
            </span>
          ))}
        </div>

        <div className={styles.days} role="rowgroup">
          {days.map((day) => {
            const dayTasks = tasksForDay(tasks, day.key)
            const dayEvents = eventsForDay(events, day.key)
            const visibleEvents = dayEvents.slice(0, 2)
            const hiddenEvents = dayEvents.length - visibleEvents.length
            const selected = day.key === selectedDay

            return (
              <button
                key={day.key}
                type="button"
                role="gridcell"
                className={cn(
                  styles.day,
                  !day.inMonth && styles.dayOutside,
                  day.isToday && styles.dayToday,
                  selected && styles.daySelected,
                )}
                aria-pressed={selected}
                aria-label={`${day.date.getDate()} ${day.inMonth ? '' : 'bulan lain, '}${dayEvents.length} acara, ${dayTasks.length} tenggat`}
                onClick={() => onSelectDay(day.key)}
              >
                <span className={styles.dayNumber}>
                  {day.date.getDate()}
                  {dayTasks.length > 0 ? (
                    <span className={styles.taskCount}>
                      {dayTasks.length} tugas
                    </span>
                  ) : null}
                </span>

                <span className={styles.entries}>
                  {visibleEvents.map((event) => {
                    const colors = eventCategoryColors(event.category_label)

                    return (
                      <span
                        key={`${event.id}-${day.key}`}
                        className={styles.event}
                        style={{
                          background: colors.background,
                          color: colors.color,
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </span>
                    )
                  })}
                  {hiddenEvents > 0 ? (
                    <span className={styles.more}>+{hiddenEvents} acara</span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
