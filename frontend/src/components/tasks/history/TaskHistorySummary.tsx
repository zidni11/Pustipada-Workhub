import type { TaskSummary } from '../../../api/tasks'
import {
  CheckCircleIcon,
  ClockIcon,
  HistoryIcon,
  TasksIcon,
} from '../../layout/icons'
import { Stat } from '../../ui/Stat'
import styles from './TaskHistorySummary.module.css'

interface TaskHistorySummaryProps {
  data: TaskSummary | null
  loading: boolean
  error: string | null
}

export function TaskHistorySummary({
  data,
  loading,
  error,
}: TaskHistorySummaryProps) {
  const counts = data?.counts
  const running = counts
    ? counts.open +
      counts.in_progress +
      counts.in_review +
      counts.revision_needed
    : 0
  const archived = counts ? counts.cancelled + counts.draft : 0
  const unavailableHint = error ? 'Ringkasan tidak tersedia' : undefined

  return (
    <section className={styles.summary} aria-label="Ringkasan seluruh tugas">
      <Stat
        label="Total tugas"
        value={data ? data.total : '—'}
        hint={unavailableHint ?? 'Seluruh tugas dalam akses Anda'}
        tone="info"
        icon={<TasksIcon />}
        loading={loading}
      />
      <Stat
        label="Sedang berjalan"
        value={data ? running : '—'}
        hint={unavailableHint ?? 'Open, progres, review, dan revisi'}
        tone="warning"
        icon={<ClockIcon />}
        loading={loading}
      />
      <Stat
        label="Selesai"
        value={data ? counts?.completed ?? 0 : '—'}
        hint={unavailableHint ?? 'Tugas yang sudah disetujui'}
        tone="success"
        icon={<CheckCircleIcon />}
        loading={loading}
      />
      <Stat
        label="Batal & draft"
        value={data ? archived : '—'}
        hint={unavailableHint ?? 'Belum berjalan atau dibatalkan'}
        tone="neutral"
        icon={<HistoryIcon />}
        loading={loading}
      />
    </section>
  )
}
