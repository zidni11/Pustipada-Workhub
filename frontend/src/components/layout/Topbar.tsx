import type { RefObject } from 'react'
import { MenuIcon } from './icons'
import styles from './Topbar.module.css'

interface TopbarProps {
  open: boolean
  onOpen: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

export function Topbar({ open, onOpen, menuButtonRef }: TopbarProps) {
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
    </header>
  )
}
