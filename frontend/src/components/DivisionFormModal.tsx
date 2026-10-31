import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '../api/client'
import { createDivision, updateDivision } from '../api/divisions'
import type { Division } from '../types/api'
import { FormField } from './FormField'
import { Modal } from './Modal'
import { Button } from './ui/Button'
import { CheckboxField, FormRow, FormStack } from './ui/FormLayout'
import { Notice } from './ui/Notice'

interface DivisionFormModalProps {
  division?: Division
  onClose: () => void
  onSaved: (division: Division) => void
}

export function DivisionFormModal({ division, onClose, onSaved }: DivisionFormModalProps) {
  const [name, setName] = useState(division?.name ?? '')
  const [code, setCode] = useState(division?.code ?? '')
  const [description, setDescription] = useState(division?.description ?? '')
  const [isActive, setIsActive] = useState(division?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string[]> = {}

    if (!name.trim()) {
      nextErrors.name = ['Nama divisi wajib diisi.']
    }

    if (!code.trim()) {
      nextErrors.code = ['Kode divisi wajib diisi.']
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    try {
      const payload = {
        name: name.trim(),
        code: code.trim(),
        description: description.trim() ? description.trim() : null,
        is_active: isActive,
      }

      const response = division
        ? await updateDivision(division.id, payload)
        : await createDivision(payload)

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
      title={division ? 'Edit Divisi' : 'Divisi Baru'}
      subtitle={division ? 'Perbarui data divisi.' : 'Tambahkan divisi baru.'}
      onClose={saving ? () => undefined : onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="division-form" loading={saving}>
            Simpan Divisi
          </Button>
        </>
      }
    >
      <FormStack id="division-form" onSubmit={handleSubmit}>
        {error ? <Notice>{error}</Notice> : null}

        <FormRow>
          <FormField label="Nama divisi" htmlFor="division-name" error={fieldErrors.name?.[0]}>
            <input
              id="division-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              required
            />
          </FormField>

          <FormField
            label="Kode"
            htmlFor="division-code"
            hint="Huruf, angka, strip, atau garis bawah."
            error={fieldErrors.code?.[0]}
          >
            <input
              id="division-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              maxLength={20}
              required
            />
          </FormField>
        </FormRow>

        <FormField label="Deskripsi" htmlFor="division-description" error={fieldErrors.description?.[0]}>
          <textarea
            id="division-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </FormField>

        <CheckboxField
          id="division-active"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          label="Divisi aktif"
        />
      </FormStack>
    </Modal>
  )
}
