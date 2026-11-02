import { useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../../api/client'
import { listAllTasks } from '../../api/tasks'
import { downloadTasks, type ExportFormat } from '../../lib/exports'
import type { TaskListParams } from '../../types/api'
import { Button } from '../ui/Button'
import styles from './TaskExportMenu.module.css'

interface TaskExportMenuProps {
  params: Omit<TaskListParams, 'page'>
  view: 'active' | 'history'
  onError: (message: string) => void
}

export function TaskExportMenu({ params, view, onError }: TaskExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node
        && !wrapRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleExport = async (format: ExportFormat) => {
    setBusy(format)

    try {
      const tasks = await listAllTasks(params)
      downloadTasks(tasks, view, format)
      setOpen(false)
    } catch (error) {
      onError(getErrorMessage(error))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <Button
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy !== null}
        onClick={() => setOpen((current) => !current)}
      >
        {busy ? 'Menyiapkan...' : 'Ekspor'}
      </Button>
      {open ? (
        <div className={styles.menu} role="menu" aria-label="Format ekspor">
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            onClick={() => void handleExport('csv')}
          >
            <strong>CSV</strong>
            <span>Untuk spreadsheet</span>
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            onClick={() => void handleExport('json')}
          >
            <strong>JSON</strong>
            <span>Data lengkap terstruktur</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
