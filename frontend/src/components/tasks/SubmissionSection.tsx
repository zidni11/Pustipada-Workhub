import { useState, type FormEvent } from 'react'
import {
  ApiError,
  getErrorMessage,
} from '../../api/client'
import {
  createTaskSubmission,
  deleteTaskSubmission,
} from '../../api/submissions'
import {
  canDeleteSubmission,
  canSubmitProof,
} from '../../lib/tasks'
import {
  formatDateTime,
  formatFileSize,
} from '../../lib/format'
import type {
  Task,
  TaskSubmission,
  TaskSubmissionType,
  User,
} from '../../types/api'
import { Avatar } from '../Avatar'
import { Section } from '../Section'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Notice } from '../ui/Notice'
import styles from './SubmissionSection.module.css'

interface SubmissionSectionProps {
  task: Task
  user: User
  onChanged: () => void
}

export function SubmissionSection({
  task,
  user,
  onChanged,
}: SubmissionSectionProps) {
  const [items, setItems] = useState<TaskSubmission[]>(task.submissions ?? [])
  const [type, setType] = useState<TaskSubmissionType>('file')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleting, setDeleting] = useState<TaskSubmission | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const canSubmit = canSubmitProof(task, user)
  const canDelete = canDeleteSubmission(task, user)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string[]> = {}

    if (!title.trim()) {
      nextErrors.title = ['Judul bukti wajib diisi.']
    }

    if (type === 'link' && !url.trim()) {
      nextErrors.url = ['Tautan wajib diisi.']
    }

    if (type === 'file' && !file) {
      nextErrors.file = ['Pilih berkas yang akan diunggah.']
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const response = await createTaskSubmission(task.id, {
        type,
        title: title.trim(),
        url: url.trim(),
        file: file ?? undefined,
      })

      setItems((current) => [response.data, ...current])
      setTitle('')
      setUrl('')
      setFile(null)
      setFileKey((current) => current + 1)
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err))

      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return

    setDeleteBusy(true)
    setError(null)

    try {
      await deleteTaskSubmission(task.id, deleting.id)
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
      title="Bukti pekerjaan"
      description="Unggah berkas atau tautan sebagai bukti hasil kerja."
      action={
        <span className={styles.count}>{items.length} bukti</span>
      }
    >
      {error ? <Notice className={styles.notice}>{error}</Notice> : null}

      {items.length === 0 ? (
        <p className={styles.empty}>Belum ada bukti yang diunggah.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.type}>{item.type_label}</span>
              <div className={styles.itemBody}>
                <strong className={styles.itemTitle}>{item.title}</strong>
                <span className={styles.meta}>
                  {item.user ? `${item.user.name} · ` : ''}
                  {formatDateTime(item.created_at)}
                  {item.original_name ? ` · ${item.original_name}` : ''}
                  {item.file_size ? ` (${formatFileSize(item.file_size)})` : ''}
                </span>
                <div className={styles.links}>
                  {item.type === 'link' && item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Buka tautan
                    </a>
                  ) : null}
                  {item.type === 'file' && item.file_url ? (
                    <a href={item.file_url} target="_blank" rel="noreferrer">
                      Unduh berkas
                    </a>
                  ) : null}
                  {canDelete ? (
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => setDeleting(item)}
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
              </div>
              {item.user ? <Avatar name={item.user.name} /> : null}
            </li>
          ))}
        </ul>
      )}

      {canSubmit ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Tambah bukti</h3>
            <span className={styles.formHint}>
              Maks. 10 MB · PDF, dokumen, gambar, atau arsip
            </span>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Jenis</span>
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value as TaskSubmissionType)
                  setFieldErrors({})
                }}
              >
                <option value="file">Berkas</option>
                <option value="link">Tautan</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Judul</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Dokumentasi hasil kegiatan"
                maxLength={255}
                aria-invalid={fieldErrors.title ? true : undefined}
              />
              {fieldErrors.title?.[0] ? (
                <em role="alert">{fieldErrors.title[0]}</em>
              ) : null}
            </label>
          </div>

          {type === 'link' ? (
            <label className={styles.field}>
              <span>Tautan</span>
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                aria-invalid={fieldErrors.url ? true : undefined}
              />
              {fieldErrors.url?.[0] ? (
                <em role="alert">{fieldErrors.url[0]}</em>
              ) : null}
            </label>
          ) : (
            <label className={styles.field}>
              <span>Berkas</span>
              <input
                key={fileKey}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.zip"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                aria-invalid={fieldErrors.file ? true : undefined}
              />
              {fieldErrors.file?.[0] ? (
                <em role="alert">{fieldErrors.file[0]}</em>
              ) : null}
            </label>
          )}

          <div className={styles.formActions}>
            <Button type="submit" loading={submitting}>
              Unggah bukti
            </Button>
          </div>
        </form>
      ) : (
        <p className={styles.readOnly}>
          Hanya PIC dan anggota pendukung yang dapat menambahkan bukti.
        </p>
      )}

      {deleting ? (
        <ConfirmDialog
          title="Hapus bukti?"
          message={`Bukti "${deleting.title}" akan dihapus permanen.`}
          confirmLabel="Hapus bukti"
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </Section>
  )
}
