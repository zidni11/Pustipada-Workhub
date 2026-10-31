import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { AppRoute } from '../../hooks/useHashRoute'
import { navigate, routePaths } from '../../hooks/useHashRoute'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../types/api'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  user: User
  route: AppRoute
  children: ReactNode
}

export function AppLayout({ user, route, children }: AppLayoutProps) {
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sidebarOpen) return

    const frame = requestAnimationFrame(() => sidebarRef.current?.focus())

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSidebarOpen(false)
      menuButtonRef.current?.focus()
    }

    const closeOnResize = () => {
      if (window.matchMedia('(min-width: 901px)').matches) {
        setSidebarOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnResize)

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnResize)
    }
  }, [sidebarOpen])

  const handleNavigate = () => {
    if (!sidebarOpen) return
    setSidebarOpen(false)
    requestAnimationFrame(() => contentRef.current?.focus())
  }

  const handleClose = () => {
    setSidebarOpen(false)
    menuButtonRef.current?.focus()
  }

  const handleLogout = async () => {
    setSidebarOpen(false)
    await logout()
    navigate(routePaths.dashboard)
  }

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={styles.skip}
        onClick={() => contentRef.current?.focus()}
      >
        Lewati ke konten
      </button>

      <Sidebar
        user={user}
        route={route}
        open={sidebarOpen}
        sidebarRef={sidebarRef}
        onNavigate={handleNavigate}
        onClose={handleClose}
        onLogout={() => void handleLogout()}
      />

      {sidebarOpen ? (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Tutup menu"
          tabIndex={-1}
          onClick={handleClose}
        />
      ) : null}

      <div className={styles.main}>
        <Topbar
          open={sidebarOpen}
          onOpen={() => setSidebarOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <main id="main-content" ref={contentRef} tabIndex={-1} className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
