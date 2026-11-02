import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { navigate, routePaths } from '../hooks/useHashRoute'
import { cn } from '../lib/cn'
import type { User } from '../types/api'
import { SearchIcon } from './layout/icons'
import styles from './CommandPalette.module.css'

interface CommandPaletteProps {
  user: User
  onClose: () => void
}

interface PaletteAction {
  id: string
  label: string
  hint: string
  group: 'Navigasi' | 'Aksi'
  keywords: string
  run: () => void
}

export function CommandPalette({ user, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const actions = useMemo<PaletteAction[]>(() => {
    const items: PaletteAction[] = [
      {
        id: 'dashboard',
        label: 'Buka dashboard',
        hint: 'Ringkasan kerja hari ini',
        group: 'Navigasi',
        keywords: 'dashboard beranda home ringkasan',
        run: () => navigate(routePaths.dashboard),
      },
    ]

    if (user.role === 'admin') {
      items.push(
        {
          id: 'users',
          label: 'Kelola pengguna',
          hint: 'Akun dan aktivasi anggota',
          group: 'Navigasi',
          keywords: 'pengguna user anggota akun',
          run: () => navigate(routePaths.users),
        },
        {
          id: 'divisions',
          label: 'Kelola divisi',
          hint: 'Struktur organisasi',
          group: 'Navigasi',
          keywords: 'divisi organisasi unit',
          run: () => navigate(routePaths.divisions),
        },
      )
    } else {
      items.push(
        {
          id: 'tasks',
          label: 'Tugas aktif',
          hint: 'Pekerjaan yang sedang berjalan',
          group: 'Navigasi',
          keywords: 'tugas task aktif pekerjaan',
          run: () => navigate(routePaths.tasks),
        },
        {
          id: 'task-history',
          label: 'Riwayat tugas',
          hint: 'Rekap seluruh arsip tugas',
          group: 'Navigasi',
          keywords: 'riwayat history selesai batal arsip rekap',
          run: () => navigate(routePaths.taskHistory),
        },
      )
    }

    items.push({
      id: 'calendar',
      label: 'Buka kalender',
      hint: 'Tenggat, acara, dan pengingat',
      group: 'Navigasi',
      keywords: 'kalender agenda acara jadwal',
      run: () => navigate(routePaths.calendar),
    })

    if (user.role === 'pimpinan') {
      items.push({
        id: 'task-new',
        label: 'Buat tugas baru',
        hint: 'Tambahkan pekerjaan dan penanggung jawab',
        group: 'Aksi',
        keywords: 'buat baru tugas task tambah',
        run: () => navigate(routePaths.taskNew),
      })
    }

    if (user.role === 'admin' || user.role === 'pimpinan') {
      items.push({
        id: 'event-new',
        label: 'Buat acara baru',
        hint: 'Meeting, lunch, atau acara komunitas',
        group: 'Aksi',
        keywords: 'buat acara event kalender meeting lunch',
        run: () => navigate(routePaths.calendarNew),
      })
    }

    return items
  }, [user.role])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) {
      return actions
    }

    return actions.filter((action) =>
      `${action.label} ${action.hint} ${action.keywords}`
        .toLowerCase()
        .includes(term),
    )
  }, [actions, query])

  useEffect(() => {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      const restoreTo = restoreFocusRef.current

      if (restoreTo?.isConnected) {
        restoreTo.focus()
      }
    }
  }, [])

  useEffect(() => {
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )

    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key === 'Tab') {
      const focusable = Array.from(
        paletteRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }

      return
    }

    if (filtered.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % filtered.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(
        (current) => (current - 1 + filtered.length) % filtered.length,
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const action = filtered[activeIndex]

      if (action) {
        onClose()
        action.run()
      }
    }
  }

  let lastGroup: PaletteAction['group'] | null = null

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={paletteRef}
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian cepat"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            placeholder="Cari halaman atau aksi..."
            aria-label="Cari halaman atau aksi"
            aria-controls="command-results"
            aria-activedescendant={
              filtered[activeIndex]
                ? `command-item-${filtered[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
          />
          <kbd className={styles.esc}>Esc</kbd>
        </div>

        <div className={styles.results}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>
              Tidak ada hasil untuk &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <ul id="command-results" ref={listRef} className={styles.list}>
              {filtered.map((action, index) => {
                const showGroup = action.group !== lastGroup
                lastGroup = action.group

                return (
                  <li key={action.id}>
                    {showGroup ? (
                      <p className={styles.group}>{action.group}</p>
                    ) : null}
                    <button
                      type="button"
                      id={`command-item-${action.id}`}
                      data-index={index}
                      className={cn(
                        styles.item,
                        index === activeIndex && styles.itemActive,
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        onClose()
                        action.run()
                      }}
                    >
                      <span className={styles.itemText}>
                        <strong>{action.label}</strong>
                        <span>{action.hint}</span>
                      </span>
                      <span className={styles.enter} aria-hidden="true">
                        &crarr;
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <span>
            <kbd>&uarr;</kbd> <kbd>&darr;</kbd> navigasi
          </span>
          <span>
            <kbd>&crarr;</kbd> buka
          </span>
        </footer>
      </div>
    </div>
  )
}
