import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../api/client'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import type { UserNotification } from '../types/api'

const POLL_INTERVAL_MS = 45_000

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!enabled) return

    try {
      const response = await listNotifications()

      if (!mountedRef.current) return

      setNotifications(response.data)
      setUnreadCount(response.unread_count)
      setError(null)
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [enabled])

  useEffect(() => {
    mountedRef.current = true

    if (!enabled) return

    // oxlint-disable-next-line react/set-state-in-effect
    void refresh()

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }, POLL_INTERVAL_MS)

    const handleFocus = () => void refresh()

    window.addEventListener('focus', handleFocus)

    return () => {
      mountedRef.current = false
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled, refresh])

  const markRead = useCallback(async (notification: UserNotification) => {
    if (notification.read_at) return

    try {
      const response = await markNotificationRead(notification.id)

      if (!mountedRef.current) return

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? response.data : item,
        ),
      )
      setUnreadCount((current) => Math.max(0, current - 1))
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err))
      }
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      const response = await markAllNotificationsRead()

      if (!mountedRef.current) return

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
      )
      setUnreadCount(response.unread_count)
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err))
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  }
}
