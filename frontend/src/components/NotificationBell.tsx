import { useEffect, useRef, useState } from 'react'
import { navigate } from '../hooks/useHashRoute'
import { useNotifications } from '../hooks/useNotifications'
import { cn } from '../lib/cn'
import { formatRelativeTime } from '../lib/format'
import type { UserNotification } from '../types/api'
import { BellIcon } from './layout/icons'
import styles from './NotificationBell.module.css'

const TYPE_LABELS: Record<UserNotification['type'], string> = {
  task_assigned: 'Tugas',
  task_status_changed: 'Status',
  event_created: 'Acara',
  account_approved: 'Akun',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target

      if (
        target instanceof Node
        && !panelRef.current?.contains(target)
        && !buttonRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleOpen = () => {
    setOpen((current) => !current)

    if (!open) {
      void refresh()
    }
  }

  const handleNotification = (notification: UserNotification) => {
    void markRead(notification)

    if (notification.target_url) {
      navigate(notification.target_url)
    }

    setOpen(false)
  }

  return (
    <div className={styles.wrap}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label={
          unreadCount > 0
            ? `Notifikasi, ${unreadCount} belum dibaca`
            : 'Notifikasi'
        }
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={handleOpen}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className={styles.count} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id="notification-panel"
          className={styles.panel}
          aria-label="Notifikasi"
        >
          <header className={styles.header}>
            <div>
              <h2 className={styles.title}>Notifikasi</h2>
              <p className={styles.subtitle}>
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : 'Semua sudah dibaca'}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                className={styles.markAll}
                onClick={() => void markAllRead()}
              >
                Tandai semua
              </button>
            ) : null}
          </header>

          <div className={styles.body}>
            {error ? (
              <div className={styles.state} role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => void refresh()}>
                  Coba lagi
                </button>
              </div>
            ) : loading && notifications.length === 0 ? (
              <p className={styles.state}>Memuat notifikasi...</p>
            ) : notifications.length === 0 ? (
              <p className={styles.state}>Belum ada notifikasi.</p>
            ) : (
              <ul className={styles.list}>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className={cn(
                        styles.item,
                        !notification.read_at && styles.itemUnread,
                      )}
                      onClick={() => handleNotification(notification)}
                    >
                      <span className={styles.type} aria-hidden="true">
                        {TYPE_LABELS[notification.type]}
                      </span>
                      <span className={styles.itemBody}>
                        <span className={styles.itemTitle}>
                          {notification.title}
                        </span>
                        <span className={styles.message}>
                          {notification.message}
                        </span>
                        <time
                          className={styles.time}
                          dateTime={notification.created_at ?? undefined}
                        >
                          {formatRelativeTime(notification.created_at)}
                        </time>
                      </span>
                      {!notification.read_at ? (
                        <span className={styles.unreadDot} aria-label="Belum dibaca" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
