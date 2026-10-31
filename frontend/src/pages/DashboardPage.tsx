import { getTaskSummary, listTasks } from '../api/tasks'
import { listDivisions } from '../api/divisions'
import { listUsers } from '../api/users'
import { Avatar } from '../components/Avatar'
import { ActiveBadge, RoleBadge, StatusBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Skeleton } from '../components/ui/Skeleton'
import { Stat } from '../components/ui/Stat'
import { Surface } from '../components/ui/Surface'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../lib/format'
import { TASK_STATUS_LABELS } from '../lib/tasks'
import type { User } from '../types/api'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return user.role === 'admin' ? <AdminDashboard /> : <TaskDashboard user={user} />
}

function TaskDashboard({ user }: { user: User }) {
  const summary = useAsync(() => getTaskSummary(), [])
  const recent = useAsync(() => listTasks({ page: 1 }), [])

  const cards: Array<{ label: string; value: number | undefined; tone: BadgeTone }> = [
    { label: 'Total tugas', value: summary.data?.total, tone: 'neutral' },
    { label: 'Dikerjakan', value: summary.data?.counts.in_progress, tone: 'info' },
    { label: 'Menunggu review', value: summary.data?.counts.in_review, tone: 'warning' },
    { label: 'Selesai', value: summary.data?.counts.completed, tone: 'success' },
  ]

  const statuses = Object.keys(TASK_STATUS_LABELS) as Array<keyof typeof TASK_STATUS_LABELS>

  return (
    <>
      <PageHeader
        title={user.role === 'pimpinan' ? 'Ringkasan tim' : 'Ringkasan pekerjaan'}
        description={
          user.role === 'pimpinan'
            ? 'Pantau pekerjaan tim dan review tugas yang menunggu.'
            : 'Lihat tugas divisi dan pekerjaan yang di-assign ke Anda.'
        }
        actions={
          <ButtonLink href="#/tasks" variant="secondary" size="sm">
            Lihat semua tugas
          </ButtonLink>
        }
      />

      {summary.error ? (
        <InlineError message={summary.error} onRetry={summary.reload} />
      ) : (
        <section className={styles.stats} aria-label="Ringkasan tugas">
          {cards.map((card) => (
            <Stat
              key={card.label}
              label={card.label}
              value={card.value ?? 0}
              tone={card.tone}
              loading={summary.loading}
            />
          ))}
        </section>
      )}

      <div className={styles.columns}>
        <Surface as="section" padding="none" aria-labelledby="recent-tasks-heading">
          <header className={styles.sectionHeader}>
            <div>
              <h2 id="recent-tasks-heading">Tugas terbaru</h2>
              <p>Perubahan terakhir pada pekerjaan tim.</p>
            </div>
            <a className={styles.textLink} href="#/tasks">
              Semua tugas
            </a>
          </header>

          {recent.loading ? (
            <div className={styles.skeletonRows} role="status" aria-label="Memuat tugas">
              {[0, 1, 2].map((row) => (
                <div key={row} className={styles.skeletonRow}>
                  <div className={styles.skeletonMain}>
                    <Skeleton lines={2} />
                  </div>
                  <Skeleton width="64px" height="20px" />
                </div>
              ))}
            </div>
          ) : recent.error ? (
            <InlineError message={recent.error} onRetry={recent.reload} />
          ) : (recent.data?.data.length ?? 0) === 0 ? (
            <p className={styles.empty}>Belum ada tugas.</p>
          ) : (
            <ul className={styles.list}>
              {recent.data?.data.slice(0, 5).map((task) => (
                <li key={task.id} className={styles.listItem}>
                  <a className={styles.row} href={`#/tasks/${task.id}`}>
                    <span className={styles.main}>
                      <span className={styles.title}>{task.title}</span>
                      <span className={styles.sub}>
                        {task.division.name}
                        {task.pic ? ` · PIC ${task.pic.name}` : ' · PIC belum ditentukan'}
                      </span>
                    </span>
                    <span className={styles.meta}>
                      <StatusBadge status={task.status} />
                      <time className={styles.due} dateTime={task.due_date ?? undefined}>
                        {formatDate(task.due_date)}
                      </time>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface as="section" tone="muted" aria-labelledby="status-heading">
          <h2 id="status-heading" className={styles.panelTitle}>
            Status pekerjaan
          </h2>
          <dl className={styles.statusList}>
            {statuses.map((status) => (
              <div key={status} className={styles.statusRow}>
                <dt>
                  <StatusBadge status={status} />
                </dt>
                <dd className={styles.statusValue}>
                  {summary.loading || summary.error ? '—' : (summary.data?.counts[status] ?? 0)}
                </dd>
              </div>
            ))}
          </dl>
        </Surface>
      </div>
    </>
  )
}

function AdminDashboard() {
  const users = useAsync(() => listUsers({ page: 1 }), [])
  const divisions = useAsync(() => listDivisions(), [])

  const activeDivisions = (divisions.data?.data ?? []).filter((division) => division.is_active).length
  const inactiveUsers = users.data?.data.filter((item) => !item.is_active).length ?? 0
  const error = users.error ?? divisions.error

  return (
    <>
      <PageHeader
        title="Ringkasan administrasi"
        description="Akun pengguna dan data master divisi."
        actions={
          <ButtonLink href="#/users" variant="secondary" size="sm">
            Kelola pengguna
          </ButtonLink>
        }
      />

      {error ? (
        <InlineError
          message={error}
          onRetry={() => {
            users.reload()
            divisions.reload()
          }}
        />
      ) : (
        <section className={styles.stats} aria-label="Ringkasan administrasi">
          <Stat
            label="Total pengguna"
            value={users.data?.meta.total ?? 0}
            tone="neutral"
            loading={users.loading}
          />
          <Stat
            label="Total divisi"
            value={divisions.data?.data.length ?? 0}
            tone="info"
            loading={divisions.loading}
          />
          <Stat
            label="Divisi aktif"
            value={activeDivisions}
            tone="success"
            loading={divisions.loading}
          />
          <Stat
            label="Akun nonaktif"
            value={inactiveUsers}
            tone="warning"
            hint="halaman ini"
            loading={users.loading}
          />
        </section>
      )}

      <div className={styles.columns}>
        <Surface as="section" padding="none" aria-labelledby="recent-users-heading">
          <header className={styles.sectionHeader}>
            <div>
              <h2 id="recent-users-heading">Pengguna terbaru</h2>
              <p>Akun yang terdaftar di Workhub.</p>
            </div>
            <a className={styles.textLink} href="#/users">
              Semua pengguna
            </a>
          </header>

          {users.loading ? (
            <div className={styles.skeletonRows} role="status" aria-label="Memuat pengguna">
              {[0, 1, 2].map((row) => (
                <div key={row} className={styles.skeletonRow}>
                  <div className={styles.skeletonMain}>
                    <Skeleton lines={2} />
                  </div>
                  <Skeleton width="56px" height="20px" />
                </div>
              ))}
            </div>
          ) : users.error ? (
            <InlineError message={users.error} onRetry={users.reload} />
          ) : (users.data?.data.length ?? 0) === 0 ? (
            <p className={styles.empty}>Belum ada pengguna.</p>
          ) : (
            <ul className={styles.list}>
              {users.data?.data.slice(0, 5).map((item) => (
                <li key={item.id} className={styles.listItem}>
                  <div className={styles.row}>
                    <div className={styles.person}>
                      <Avatar name={item.name} />
                      <div className={styles.main}>
                        <span className={styles.title}>{item.name}</span>
                        <span className={styles.sub}>{item.email}</span>
                      </div>
                    </div>
                    <div className={styles.meta}>
                      {item.is_active ? null : (
                        <Badge tone="neutral" dot={false}>
                          Nonaktif
                        </Badge>
                      )}
                      <RoleBadge role={item.role} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface as="section" tone="muted" padding="none" aria-labelledby="divisions-heading">
          <header className={styles.sectionHeader}>
            <div>
              <h2 id="divisions-heading">Divisi</h2>
              <p>Data master unit kerja.</p>
            </div>
            <a className={styles.textLink} href="#/divisions">
              Semua divisi
            </a>
          </header>

          {divisions.loading ? (
            <div className={styles.skeletonRows} role="status" aria-label="Memuat divisi">
              {[0, 1, 2].map((row) => (
                <div key={row} className={styles.skeletonRow}>
                  <div className={styles.skeletonMain}>
                    <Skeleton lines={2} />
                  </div>
                  <Skeleton width="52px" height="20px" />
                </div>
              ))}
            </div>
          ) : divisions.error ? (
            <InlineError message={divisions.error} onRetry={divisions.reload} />
          ) : (divisions.data?.data.length ?? 0) === 0 ? (
            <p className={styles.empty}>Belum ada divisi.</p>
          ) : (
            <ul className={styles.list}>
              {divisions.data?.data.slice(0, 5).map((division) => (
                <li key={division.id} className={styles.listItem}>
                  <div className={styles.row}>
                    <div className={styles.main}>
                      <span className={styles.title}>{division.name}</span>
                      <span className={styles.divisionCode}>{division.code}</span>
                    </div>
                    <ActiveBadge active={division.is_active} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.inlineError} role="alert">
      <span>{message}</span>
      <button type="button" className={styles.retry} onClick={onRetry}>
        Coba lagi
      </button>
    </div>
  )
}
