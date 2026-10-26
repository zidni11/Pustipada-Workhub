import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '../api/client'
import { createTask, updateTask } from '../api/tasks'
import { TASK_PRIORITY_LABELS } from '../lib/tasks'
import type { CreateTaskInput, Division, Task, TaskPriority, User } from '../types/api'
import { FormField } from './FormField'
import { Modal } from './Modal'

interface TaskFormModalProps {
  task?: Task
  divisions: Division[]
  users: User[]
  onClose: () => void
  onSaved: (task: Task) => void
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export function TaskFormModal({ task, divisions, users, onClose, onSaved }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [divisionId, setDivisionId] = useState(
    task ? String(task.division_id) : divisions[0] ? String(divisions[0].id) : '',
  )
  const [picId, setPicId] = useState(task?.pic ? String(task.pic.id) : '')
  const [memberIds, setMemberIds] = useState<number[]>(() => (task?.members ?? []).map((member) => member.id))
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const activeUsers = users.filter((user) => user.is_active)

  const toggleMember = (id: number) => {
    setMemberIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string[]> = {}

    if (!title.trim()) {
      nextErrors.title = ['Judul tugas wajib diisi.']
    }

    if (!divisionId) {
      nextErrors.division_id = ['Divisi wajib dipilih.']
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    const payload: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      priority,
      division_id: Number(divisionId),
      pic_id: picId ? Number(picId) : null,
      member_ids: memberIds,
      due_date: dueDate || null,
    }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    try {
      const response = task ? await updateTask(task.id, payload) : await createTask(payload)
      onSaved(response.data)
    } catch (err) {
      setError(getErrorMessage(err))

      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={task ? 'Edit Tugas' : 'Tugas Baru'}
      subtitle={task ? 'Perbarui detail tugas.' : 'Buat tugas baru untuk tim.'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-ghost" onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button type="submit" form="task-form" className="button button-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Tugas'}
          </button>
        </>
      }
    >
      <form id="task-form" className="form-grid" onSubmit={handleSubmit}>
        {error ? <div className="alert alert-error">{error}</div> : null}

        <FormField label="Judul" htmlFor="task-title" error={fieldErrors.title?.[0]}>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Contoh: Input katalog buku baru"
            maxLength={255}
            required
          />
        </FormField>

        <FormField label="Deskripsi" htmlFor="task-description" error={fieldErrors.description?.[0]}>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Detail pekerjaan, kriteria selesai, atau catatan pendukung."
          />
        </FormField>

        <div className="form-row">
          <FormField label="Divisi" htmlFor="task-division" error={fieldErrors.division_id?.[0]}>
            <select
              id="task-division"
              value={divisionId}
              onChange={(event) => setDivisionId(event.target.value)}
              required
            >
              <option value="">Pilih divisi</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                  {division.is_active ? '' : ' (nonaktif)'}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Prioritas" htmlFor="task-priority" error={fieldErrors.priority?.[0]}>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {TASK_PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField
            label="PIC"
            htmlFor="task-pic"
            hint="Penanggung jawab utama tugas."
            error={fieldErrors.pic_id?.[0]}
          >
            <select id="task-pic" value={picId} onChange={(event) => setPicId(event.target.value)}>
              <option value="">Belum ditentukan</option>
              {activeUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tenggat" htmlFor="task-due-date" error={fieldErrors.due_date?.[0]}>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="Anggota pendukung"
          htmlFor="task-members"
          hint="Pilih anggota yang ikut mengerjakan tugas ini."
          error={fieldErrors.member_ids?.[0]}
        >
          <div id="task-members" className="member-picker">
            {activeUsers.length === 0 ? (
              <p className="form-hint">Belum ada pengguna aktif.</p>
            ) : (
              activeUsers.map((user) => (
                <label key={user.id} className="member-option">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                  />
                  <span>
                    {user.name}
                    <small>{user.division?.name ?? 'Tanpa divisi'}</small>
                  </span>
                </label>
              ))
            )}
          </div>
        </FormField>
      </form>
    </Modal>
  )
}
