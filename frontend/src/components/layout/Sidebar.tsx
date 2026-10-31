import type { ReactNode, RefObject } from 'react'
import type { AppRoute } from '../../hooks/useHashRoute'
import { routePaths } from '../../hooks/useHashRoute'
import { cn } from '../../lib/cn'
import type { User } from '../../types/api'
import { Avatar } from '../Avatar'
import { RoleBadge } from '../Badges'
import { BuildingIcon, CloseIcon, DashboardIcon, LogoutIcon, TasksIcon, UsersIcon } from './icons'
import styles from './Sidebar.module.css'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  isActive: (route: AppRoute) => boolean
}

interface SidebarProps {
  user: User
  route: AppRoute
  open: boolean
  sidebarRef: RefObject<HTMLElement | null>
  onNavigate: () => void
  onClose: () => void
  onLogout: () => void
}

function navItemsFor(user: User): NavItem[] {
  const items: NavItem[] = [
    {
      label: 'Dashboard',
      path: routePaths.dashboard,
      icon: <DashboardIcon />,
      isActive: (route) => route.name === 'dashboard',
    },
  ]

  if (user.role === 'admin') {
    items.push(
      {
        label: 'Pengguna',
        path: routePaths.users,
        icon: <UsersIcon />,
        isActive: (route) => route.name === 'users',
      },
      {
        label: 'Divisi',
        path: routePaths.divisions,
        icon: <BuildingIcon />,
        isActive: (route) => route.name === 'divisions',
      },
    )
  } else {
    items.push({
      label: 'Tugas',
      path: routePaths.tasks,
      icon: <TasksIcon />,
      isActive: (route) => route.name === 'tasks' || route.name === 'task',
    })
  }

  return items
}

export function Sidebar({
  user,
  route,
  open,
  sidebarRef,
  onNavigate,
  onClose,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      ref={sidebarRef}
      id="app-sidebar"
      className={cn(styles.sidebar, open && styles.open)}
      tabIndex={-1}
      aria-label="Navigasi utama"
    >
      <div className={styles.brand}>
        <span className={styles.monogram} aria-hidden="true">
          PW
        </span>
        <div className={styles.brandText}>
          <strong>Pustipada</strong>
          <span>Workhub</span>
        </div>
        <button
          type="button"
          className={styles.close}
          aria-label="Tutup menu"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Menu utama">
        <p className={styles.navHeading}>Menu</p>
        {navItemsFor(user).map((item) => {
          const active = item.isActive(route)

          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={cn(styles.navLink, active && styles.navLinkActive)}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <Avatar name={user.name} className={styles.avatar} />
          <div className={styles.userMeta}>
            <strong title={user.name}>{user.name}</strong>
            <span>{user.division?.name ?? 'Tanpa divisi'}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <RoleBadge role={user.role} />
          <button type="button" className={styles.logout} onClick={onLogout}>
            <LogoutIcon />
            Keluar
          </button>
        </div>
      </div>
    </aside>
  )
}
