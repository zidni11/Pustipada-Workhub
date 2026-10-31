import type { ReactNode } from 'react'
import { Button } from './ui/Button'
import styles from './ListToolbar.module.css'

interface ListToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  onSearch: () => void
  placeholder: string
  searchLabel: string
  filters?: ReactNode
}

export function ListToolbar({
  query,
  onQueryChange,
  onSearch,
  placeholder,
  searchLabel,
  filters,
}: ListToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <form
        className={styles.search}
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          onSearch()
        }}
      >
        <input
          className={styles.input}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={searchLabel}
        />
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      {filters ? <div className={styles.filters}>{filters}</div> : null}
    </div>
  )
}
