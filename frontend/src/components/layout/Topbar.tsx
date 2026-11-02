import type { RefObject } from 'react'
import { NotificationBell } from '../NotificationBell'
import { MenuIcon, SearchIcon } from './icons'
import styles from './Topbar.module.css'

interface TopbarProps {
  open: boolean
  onOpen: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onOpenPalette: () => void
}

export function Topbar({
  open,
  onOpen,
  menuButtonRef,
  onOpenPalette,
}: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <button
        ref={menuButtonRef}
        type="button"
        className={styles.menuButton}
        aria-label="Buka menu"
        aria-controls="app-sidebar"
        aria-expanded={open}
        onClick={onOpen}
      >
        <MenuIcon />
      </button>
      <div className={styles.brand}>
        <strong>Pustipada</strong>
        <span>Workhub</span>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.palette}
          onClick={onOpenPalette}
          aria-label="Buka pencarian cepat"
        >
          <span className={styles.paletteIcon} aria-hidden="true">
            <SearchIcon />
          </span>
          <span className={styles.paletteLabel}>Cari atau lompat...</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>
        <NotificationBell />
      </div>
    </header>
  )
}
