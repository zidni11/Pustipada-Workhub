import { getTaskSummary, listTasks } from '../api/tasks'
import { listDivisions } from '../api/divisions'
import { listUsers } from '../api/users'
import { Avatar } from '../components/Avatar'
import { RoleBadge, StatusBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../lib/format'
import { TASK_STATUS_LABELS } from '../lib/tasks'
import type { User } from '../types/api'

export function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return user.role === 'admin' ? <AdminDashboard user={user} /> : <TaskDashboard user={user} />
}

function TaskDashboard({ user }: { user: User }) {
  const summary = useAsync(() => getTaskSummary(), [])
  const recent = useAsync(() => listTasks({ page: 1 }), [])

  const cards = [
    { label: 'Total tugas', value: summary.data?.total, tone: 'neutral' },
    { label: 'Dikerjakan', value: summary.data?.counts.in_progress, tone: 'info' },
    { label: 'Menunggu review', value: summary.data?.counts.in_review, tone: 'warning' },
    { label: 'Selesai', value: summary.data?.counts.completed, tone: 'success' },
  ]

  return (
    <>
      <PageHeader
        title={`Halo, ${user.name.split(' ')[0]}`}
        description={
          user.role === 'pimpinan'
            ? 'Pantau pekerjaan tim dan review tugas yang menunggu.'
            : 'Lihat tugas divisi dan pekerjaan yang di-assign ke Anda.'
        }
        actions={
          <a className="button button-primary" href="#/tasks">
            Lihat semua tugas
          </a>
        }
      />

      {summary.error ? (
        <ErrorState message={summary.error} onRetry={summary.reload} />
      ) : (
        <section className="stat-grid">
          {cards.map((card) => (
            <article key={card.label} className={`stat-card stat-${card.tone}`}>
              <span>{card.label}</span>
              <strong>{summary.loading ? '...' : (card.value ?? 0)}</strong>
            </article>
          ))}
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Tugas terbaru</h2>
            <p>Perubahan terakhir pada pekerjaan tim.</p>
          </div>
          <a className="text-link" href="#/tasks">
            Semua tugas
          </a>
        </div>

        {recent.loading ? (
          <LoadingState label="Memuat tugas..." />
        ) : recent.error ? (
          <ErrorState message={recent.error} onRetry={recent.reload} />
        ) : (recent.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Belum ada tugas" description="Tugas baru akan muncul di sini." />
        ) : (
          <ul className="task-list">
            {recent.data?.data.slice(0, 5).map((task) => (
              <li key={task.id}>
                <a className="task-list-item" href={`#/tasks/${task.id}`}>
                  <div className="task-list-main">
                    <strong>{task.title}</strong>
                    <span>
                      {task.division.name}
                      {task.pic ? ` · PIC ${task.pic.name}` : ' · PIC belum ditentukan'}
                    </span>
                  </div>
                  <div className="task-list-meta">
                    <StatusBadge status={task.status} />
                    <span className="task-due">{formatDate(task.due_date)}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel panel-muted">
        <h2>Status pekerjaan</h2>
        <div className="status-summary">
          {(Object.keys(TASK_STATUS_LABELS) as Array<keyof typeof TASK_STATUS_LABELS>).map(
            (status) => (
              <div key={status} className="status-summary-item">
                <StatusBadge status={status} />
                <strong>{summary.data?.counts[status] ?? 0}</strong>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  )
}

function AdminDashboard({ user }: { user: User }) {
  const users = useAsync(() => listUsers({ page: 1 }), [])
  const divisions = useAsync(() => listDivisions(), [])

  const activeDivisions = (divisions.data?.data ?? []).filter((division) => division.is_active).length

  return (
    <>
      <PageHeader
        title={`Halo, ${user.name.split(' ')[0]}`}
        description="Kelola akun pengguna dan data master divisi."
        actions={
          <a className="button button-primary" href="#/users">
            Kelola pengguna
          </a>
        }
      />

      <section className="stat-grid">
        <article className="stat-card stat-neutral">
          <span>Total pengguna</span>
          <strong>{users.loading ? '...' : (users.data?.meta.total ?? 0)}</strong>
        </article>
        <article className="stat-card stat-info">
          <span>Total divisi</span>
          <strong>{divisions.loading ? '...' : (divisions.data?.data.length ?? 0)}</strong>
        </article>
        <article className="stat-card stat-success">
          <span>Divisi aktif</span>
          <strong>{divisions.loading ? '...' : activeDivisions}</strong>
        </article>
        <article className="stat-card stat-warning">
          <span>Akun nonaktif (halaman ini)</span>
          <strong>
            {users.loading ? '...' : (users.data?.data.filter((item) => !item.is_active).length ?? 0)}
          </strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Pengguna terbaru</h2>
            <p>Akun yang terdaftar di Workhub.</p>
          </div>
          <a className="text-link" href="#/users">
            Semua pengguna
          </a>
        </div>

        {users.loading ? (
          <LoadingState label="Memuat pengguna..." />
        ) : users.error ? (
          <ErrorState message={users.error} onRetry={users.reload} />
        ) : (users.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Belum ada pengguna" />
        ) : (
          <ul className="people-list">
            {users.data?.data.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Avatar name={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                </div>
                <RoleBadge role={item.role} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
