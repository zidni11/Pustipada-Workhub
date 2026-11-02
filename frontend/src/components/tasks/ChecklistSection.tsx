import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '../../api/client'
import {
  createTaskChecklist,
  deleteTaskChecklist,
  toggleTaskChecklist,
} from '../../api/checklists'
import {
  canDeleteChecklist,
  canManageChecklists,
} from '../../lib/tasks'
import type { Task, TaskChecklist, User } from '../../types/api'
import { Section } from '../Section'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Notice } from '../ui/Notice'
import styles from './ChecklistSection.module.css'

interface ChecklistSectionProps {
  task: Task
  user: User
  onChanged: () => void
}

export function ChecklistSection({
  task,
  user,
  onChanged,
}: ChecklistSectionProps) {
  const [items, setItems] = useState<TaskChecklist[]>(task.checklists ?? [])
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<TaskChecklist | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManage = canManageChecklists(task, user)
  const canDelete = canDeleteChecklist(task, user)

  const completed = items.filter((item) => item.is_completed).length
  const percentage =
    items.length === 0 ? 0 : Math.round((completed / items.length) * 100)

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) return

    setCreating(true)
    setError(null)

    try {
      const response = await createTaskChecklist(task.id, title.trim())
      setItems((current) => [...current, response.data])
      setTitle('')
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (item: TaskChecklist) => {
    if (!canManage) return

    setPendingId(item.id)
    setError(null)

    try {
      const response = await toggleTaskChecklist(task.id, item.id)
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? response.data : currentItem,
        ),
      )
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return

    setDeleteBusy(true)
    setError(null)

    try {
      await deleteTaskChecklist(task.id, deleting.id)
      setItems((current) =>
        current.filter((item) => item.id !== deleting.id),
      )
      setDeleting(null)
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err))
      setDeleting(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <Section
      title="Checklist"
      description="Pecah pekerjaan menjadi langkah kecil yang dapat dicentang."
      action={
        <span className={styles.progressText}>
          {completed}/{items.length} selesai
        </span>
      }
    >
      <div className={styles.progress} aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>

      {error ? <Notice className={styles.notice}>{error}</Notice> : null}

      {items.length === 0 ? (
        <p className={styles.empty}>
          Belum ada item checklist. Tambahkan langkah pertama untuk memulai.
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  disabled={!canManage || pendingId === item.id}
                  onChange={() => void handleToggle(item)}
                />
                <span className={styles.title}>
                  <span
                    className={
                      item.is_completed ? styles.completed : undefined
                    }
                  >
                    {item.title}
                  </span>
                  {item.completed_by ? (
                    <span className={styles.meta}>
                      Dicentang oleh {item.completed_by.name}
                    </span>
                  ) : null}
                </span>
              </label>
              {canDelete ? (
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Hapus checklist ${item.title}`}
                  onClick={() => setDeleting(item)}
                >
                  Hapus
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <form className={styles.addForm} onSubmit={handleCreate}>
          <label className={styles.srOnly} htmlFor="new-checklist">
            Item checklist baru
          </label>
          <input
            id="new-checklist"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tambah langkah..."
            maxLength={255}
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={creating}
            disabled={!title.trim()}
          >
            Tambah
          </Button>
        </form>
      ) : (
        <p className={styles.readOnly}>
          Hanya PIC dan pimpinan yang dapat mengubah checklist.
        </p>
      )}

      {deleting ? (
        <ConfirmDialog
          title="Hapus item checklist?"
          message={`Item "${deleting.title}" akan dihapus dari tugas.`}
          confirmLabel="Hapus item"
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </Section>
  )
}
