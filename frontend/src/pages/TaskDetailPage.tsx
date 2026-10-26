import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { listDivisions } from '../api/divisions'
import { deleteTask, getTask, transitionTask } from '../api/tasks'
import { listAllUsers } from '../api/users'
import { Avatar } from '../components/Avatar'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { ErrorState, LoadingState } from '../components/PageState'
import { TaskFormModal } from '../components/TaskFormModal'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { navigate, routePaths } from '../hooks/useHashRoute'
import { formatDate, formatDateTime } from '../lib/format'
import {
  allowedTransitionsFor,
  canManageTasks,
  TASK_STATUS_LABELS,
  transitionLabel,
} from '../lib/tasks'
import type { Task, TaskStatus } from '../types/api'

export function TaskDetailPage({ id }: { id: number }) {
  const { user } = useAuth()
  const taskResult = useAsync(() => getTask(id), [id])
  const canManage = user ? canManageTasks(user) : false
  const divisions = useAsync(() => listDivisions(), [])
  const users = useAsync(
    () => (canManage ? listAllUsers() : Promise.resolve([])),
    [canManage],
  )

  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState('')
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  if (!user) {
    return null
  }

  const task = taskResult.data?.data ?? null

  if (taskResult.loading) {
    return (
      <>
        <BackLink />
        <LoadingState label="Memuat detail tugas..." />
      </>
    )
  }

  if (taskResult.error || !task) {
    return (
      <>
        <BackLink />
        <ErrorState
          message={taskResult.error ?? 'Tugas tidak ditemukan.'}
          onRetry={taskResult.reload}
        />
      </>
    )
  }

  const allowedTransitions = allowedTransitionsFor(task, user)
  const activities = task.activities ?? []

  const updateTaskState = (updated: Task) => {
    taskResult.setData({ data: updated })
  }

  const handleTransition = async (target: TaskStatus) => {
    setPendingStatus(target)
    setActionError(null)

    try {
      const response = await transitionTask(task.id, {
        status: target,
        note: note.trim() ? note.trim() : null,
      })

      updateTaskState(response.data)
      setNote('')
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setPendingStatus(null)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Hapus tugas ini? Tindakan ini tidak bisa dibatalkan.')) {
      return
    }

    setActionError(null)

    try {
      await deleteTask(task.id)
      navigate(routePaths.tasks)
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <>
      <BackLink />

      <PageHeader
        title={task.title}
        description={`Dibuat oleh ${task.creator.name} pada ${formatDateTime(task.created_at)}`}
        actions={
          canManage ? (
            <div className="page-header-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button type="button" className="button button-danger" onClick={handleDelete}>
                Hapus
              </button>
            </div>
          ) : null
        }
      />

      <div className="detail-badges">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {actionError && !allowedTransitions.length ? (
        <div className="alert alert-error">{actionError}</div>
      ) : null}

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <h2>Deskripsi</h2>
            <p className="pre-line">{task.description ?? 'Belum ada deskripsi.'}</p>
          </section>

          <section className="panel">
            <h2>Aktivitas</h2>
            {activities.length === 0 ? (
              <p className="muted">Belum ada aktivitas.</p>
            ) : (
              <ol className="timeline">
                {activities.map((activity) => (
                  <li key={activity.id} className="timeline-item">
                    <span className="timeline-dot" aria-hidden="true" />
                    <div className="timeline-content">
                      <p>
                        <strong>{activity.user?.name ?? 'Sistem'}</strong>{' '}
                        {activity.action === 'created'
                          ? 'membuat tugas'
                          : 'mengubah status'}
                      </p>
                      {activity.action === 'status_changed' ? (
                        <p className="timeline-status">
                          {activity.from_status
                            ? TASK_STATUS_LABELS[activity.from_status]
                            : '—'}{' '}
                          →{' '}
                          {activity.to_status
                            ? TASK_STATUS_LABELS[activity.to_status]
                            : '—'}
                        </p>
                      ) : null}
                      {activity.note ? (
                        <p className="timeline-note">&ldquo;{activity.note}&rdquo;</p>
                      ) : null}
                      <span className="timeline-time">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <section className="panel">
            <h2>Informasi</h2>
            <dl className="detail-list">
              <div>
                <dt>Divisi</dt>
                <dd>{task.division.name}</dd>
              </div>
              <div>
                <dt>PIC</dt>
                <dd>
                  {task.pic ? (
                    <span className="person-inline">
                      <Avatar name={task.pic.name} />
                      {task.pic.name}
                    </span>
                  ) : (
                    'Belum ditentukan'
                  )}
                </dd>
              </div>
              <div>
                <dt>Tenggat</dt>
                <dd>{formatDate(task.due_date)}</dd>
              </div>
              <div>
                <dt>Selesai</dt>
                <dd>{formatDateTime(task.completed_at)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>Anggota pendukung</h2>
            {task.members.length === 0 ? (
              <p className="muted">Belum ada anggota pendukung.</p>
            ) : (
              <ul className="people-list compact">
                {task.members.map((member) => (
                  <li key={member.id}>
                    <Avatar name={member.name} />
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.division?.name ?? 'Tanpa divisi'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {allowedTransitions.length > 0 ? (
            <section className="panel panel-accent">
              <h2>Ubah status</h2>
              <p className="muted">
                {user.role === 'pimpinan'
                  ? 'Sebagai pimpinan Anda dapat memindahkan status sesuai alur.'
                  : 'Anda hanya dapat memindahkan status tugas yang di-assign kepada Anda.'}
              </p>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Catatan untuk perubahan status (opsional)"
                aria-label="Catatan perubahan status"
              />
              {actionError ? <p className="form-error">{actionError}</p> : null}
              <div className="transition-actions">
                {allowedTransitions.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={
                      target === 'cancelled'
                        ? 'button button-danger-outline'
                        : 'button button-primary'
                    }
                    disabled={pendingStatus !== null}
                    onClick={() => handleTransition(target)}
                  >
                    {pendingStatus === target
                      ? 'Memproses...'
                      : transitionLabel(task.status, target)}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="panel panel-muted">
              <h2>Status</h2>
              <p className="muted">
                {task.status === 'completed' || task.status === 'cancelled'
                  ? 'Tugas sudah berada di status akhir.'
                  : 'Tidak ada transisi status yang tersedia untuk Anda.'}
              </p>
            </section>
          )}
        </aside>
      </div>

      {editing ? (
        <TaskFormModal
          task={task}
          divisions={divisions.data?.data ?? []}
          users={users.data ?? []}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setEditing(false)
            updateTaskState(updated)
          }}
        />
      ) : null}
    </>
  )
}

function BackLink() {
  return (
    <a className="back-link" href="#/tasks">
      <span aria-hidden="true">←</span> Kembali ke daftar tugas
    </a>
  )
}
