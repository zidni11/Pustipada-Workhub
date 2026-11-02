import type { KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import styles from './TaskDetailTabs.module.css'

export interface TaskDetailTab {
  id: string
  label: string
  count?: number
}

interface TaskDetailTabsProps {
  tabs: TaskDetailTab[]
  active: string
  onChange: (id: string) => void
}

export function TaskDetailTabs({
  tabs,
  active,
  onChange,
}: TaskDetailTabsProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    const next = tabs[nextIndex]

    if (!next) return

    onChange(next.id)
    requestAnimationFrame(() => {
      document.getElementById(`task-tab-${next.id}`)?.focus()
    })
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label="Bagian detail tugas">
      {tabs.map((tab, index) => {
        const selected = tab.id === active

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`task-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`task-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={cn(styles.tab, selected && styles.active)}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span className={styles.count}>{tab.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
