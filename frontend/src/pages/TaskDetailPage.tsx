import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { listDivisions } from '../api/divisions'
import { deleteTask, getTask, transitionTask } from '../api/tasks'
import { listAllUsers } from '../api/users'
import { Avatar } from '../components/Avatar'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { FormField } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { ErrorState, LoadingState } from '../components/PageState'
import { Section } from '../components/Section'
import { TaskFormModal } from '../components/TaskFormModal'
import { ChecklistSection } from '../components/tasks/ChecklistSection'
import { SubmissionSection } from '../components/tasks/SubmissionSection'
import {
  TaskDetailTabs,
  type TaskDetailTab,
} from '../components/tasks/TaskDetailTabs'
import { ArrowLeftIcon, ArrowRightIcon } from '../components/ui/Arrows'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Notice } from '../components/ui/Notice'
import { Surface } from '../components/ui/Surface'
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
import styles from './TaskDetailPage.module.css'

export function TaskDetailPage({ id }: { id: number }) {
  const { user } = useAuth()
  const taskResult = useAsync(() => getTask(id), [id])
  const canManage = user ? canManageTasks(user) : false
  const divisions = useAsync(() => listDivisions(), [])
  const users = useAsync(
    () => (canManage ? listAllUsers() : Promise.resolve([])),
    [canManage],
  )

  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState('')
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (!user) {
    return null
  }

  const task = taskResult.data?.data ?? null

  if (taskResult.loading) {
    return (
      <>
        <BackLink />
        <Surface padding="none">
          <LoadingState label="Memuat detail tugas..." />
        </Surface>
      </>
    )
  }

  if (taskResult.error || !task) {
    return (
      <>
        <BackLink />
        <Surface padding="none">
          <ErrorState
            message={taskResult.error ?? 'Tugas tidak ditemukan.'}
            onRetry={taskResult.reload}
          />
        </Surface>
      </>
    )
  }

  const allowedTransitions = allowedTransitionsFor(task, user)
  const activities = task.activities ?? []
  const tabs: TaskDetailTab[] = [
    { id: 'overview', label: 'Ringkasan' },
    {
      id: 'checklist',
      label: 'Checklist',
      count: task.checklists?.length ?? 0,
    },
    {
      id: 'proof',
      label: 'Bukti',
      count: task.submissions?.length ?? 0,
    },
  ]

  const updateTaskState = (updated: Task) => {
    taskResult.setData({ data: updated })
  }

  const refreshTask = () => {
    void getTask(id)
      .then((response) => taskResult.setData(response))
      .catch(() => undefined)
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
    setDeleting(true)
    setActionError(null)

    try {
      await deleteTask(task.id)
      navigate(routePaths.tasks)
    } catch (error) {
      setActionError(getErrorMessage(error))
      setConfirmingDelete(false)
    } finally {
      setDeleting(false)
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
            <>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                Hapus
              </Button>
            </>
          ) : null
        }
      />

      <div className={styles.badges}>
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {actionError ? (
        <Notice className={styles.notice}>{actionError}</Notice>
      ) : null}

      <div className={styles.tabsBar}>
        <TaskDetailTabs
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <div
            className={styles.tabPanel}
            role="tabpanel"
            id={`task-panel-${activeTab}`}
            aria-labelledby={`task-tab-${activeTab}`}
          >
            {activeTab === 'overview' ? (
              <>
                <Section title="Deskripsi">
                  <p className={styles.description}>
                    {task.description ?? 'Belum ada deskripsi.'}
                  </p>
                </Section>

                <Section
                  title="Aktivitas"
                  description="Riwayat pembuatan dan perubahan status."
                >
                  {activities.length === 0 ? (
                    <p className={styles.muted}>Belum ada aktivitas.</p>
                  ) : (
                    <ol className={styles.timeline}>
                      {activities.map((activity) => (
                        <li key={activity.id} className={styles.timelineItem}>
                          <span className={styles.marker} aria-hidden="true" />
                          <div className={styles.timelineBody}>
                            <p className={styles.activityTitle}>
                              <strong>{activity.user?.name ?? 'Sistem'}</strong>{' '}
                              {activity.action === 'created'
                                ? 'membuat tugas'
                                : 'mengubah status'}
                            </p>
                            {activity.action === 'status_changed' ? (
                              <p className={styles.statusChange}>
                                <span>
                                  {activity.from_status
                                    ? TASK_STATUS_LABELS[activity.from_status]
                                    : '-'}
                                </span>
                                <span className={styles.arrow} aria-hidden="true">
                                  <ArrowRightIcon size={12} />
                                </span>
                                <span>
                                  {activity.to_status
                                    ? TASK_STATUS_LABELS[activity.to_status]
                                    : '-'}
                                </span>
                              </p>
                            ) : null}
                            {activity.note ? (
                              <p className={styles.note}>{activity.note}</p>
                            ) : null}
                            <time
                              className={styles.time}
                              dateTime={activity.created_at ?? undefined}
                            >
                              {formatDateTime(activity.created_at)}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </Section>
              </>
            ) : activeTab === 'checklist' ? (
              <ChecklistSection
                key={`${task.id}-${task.updated_at ?? ''}`}
                task={task}
                user={user}
                onChanged={refreshTask}
              />
            ) : (
              <SubmissionSection
                key={`${task.id}-${task.updated_at ?? ''}`}
                task={task}
                user={user}
                onChanged={refreshTask}
              />
            )}
          </div>
        </div>

        <aside className={styles.side}>
          <Section title="Informasi">
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt>Divisi</dt>
                <dd>{task.division.name}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>PIC</dt>
                <dd>
                  {task.pic ? (
                    <span className={styles.person}>
                      <Avatar name={task.pic.name} />
                      {task.pic.name}
                    </span>
                  ) : (
                    'Belum ditentukan'
                  )}
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Tenggat</dt>
                <dd className={styles.mono}>{formatDate(task.due_date)}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Selesai</dt>
                <dd className={styles.mono}>{formatDateTime(task.completed_at)}</dd>
              </div>
            </dl>
          </Section>

          <Section title="Anggota pendukung">
            {task.members.length === 0 ? (
              <p className={styles.muted}>Belum ada anggota pendukung.</p>
            ) : (
              <ul className={styles.memberList}>
                {task.members.map((member) => (
                  <li key={member.id} className={styles.memberRow}>
                    <Avatar name={member.name} />
                    <span className={styles.memberText}>
                      <strong>{member.name}</strong>
                      <span>{member.division?.name ?? 'Tanpa divisi'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {allowedTransitions.length > 0 ? (
            <Section
              title="Ubah status"
              description={
                user.role === 'pimpinan'
                  ? 'Sebagai pimpinan Anda dapat memindahkan status sesuai alur.'
                  : 'Anda hanya dapat memindahkan status tugas yang di-assign kepada Anda.'
              }
            >
              <FormField
                label="Catatan perubahan"
                htmlFor="task-status-note"
                hint="Opsional, tersimpan pada riwayat aktivitas."
              >
                <textarea
                  id="task-status-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="Alasan atau konteks perubahan status"
                />
              </FormField>
              <div className={styles.transitions}>
                {allowedTransitions.map((target) => (
                  <Button
                    key={target}
                    variant={target === 'cancelled' ? 'danger' : 'primary'}
                    disabled={pendingStatus !== null}
                    loading={pendingStatus === target}
                    onClick={() => handleTransition(target)}
                  >
                    {transitionLabel(task.status, target)}
                  </Button>
                ))}
              </div>
            </Section>
          ) : (
            <Section title="Status">
              <p className={styles.muted}>
                {task.status === 'completed' || task.status === 'cancelled'
                  ? 'Tugas sudah berada di status akhir.'
                  : 'Tidak ada transisi status yang tersedia untuk Anda.'}
              </p>
            </Section>
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

      {confirmingDelete ? (
        <ConfirmDialog
          title="Hapus tugas?"
          message={`Tugas ${task.title} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus tugas"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      ) : null}
    </>
  )
}

function BackLink() {
  return (
    <ButtonLink
      className={styles.back}
      href="#/tasks"
      variant="ghost"
      size="sm"
      leadingIcon={<ArrowLeftIcon />}
    >
      Kembali ke daftar tugas
    </ButtonLink>
  )
}
