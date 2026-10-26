import { useState, type ReactNode } from 'react'
import type { AppRoute } from '../hooks/useHashRoute'
import { navigate, routePaths } from '../hooks/useHashRoute'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types/api'
import { Avatar } from './Avatar'
import { RoleBadge } from './Badges'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  isActive: (route: AppRoute) => boolean
}

interface AppLayoutProps {
  user: User
  route: AppRoute
  children: ReactNode
}

export function AppLayout({ user, route, children }: AppLayoutProps) {
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: routePaths.dashboard,
      icon: <DashboardIcon />,
      isActive: (current) => current.name === 'dashboard',
    },
  ]

  if (user.role === 'admin') {
    navItems.push(
      {
        label: 'Pengguna',
        path: routePaths.users,
        icon: <UsersIcon />,
        isActive: (current) => current.name === 'users',
      },
      {
        label: 'Divisi',
        path: routePaths.divisions,
        icon: <BuildingIcon />,
        isActive: (current) => current.name === 'divisions',
      },
    )
  } else {
    navItems.push({
      label: 'Tugas',
      path: routePaths.tasks,
      icon: <TasksIcon />,
      isActive: (current) => current.name === 'tasks' || current.name === 'task',
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate(routePaths.dashboard)
  }

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark">PW</span>
          <div className="brand-text">
            <strong>Pustipada</strong>
            <span>Workhub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-heading">Menu</p>
          {navItems.map((item) => (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={item.isActive(route) ? 'nav-link is-active' : 'nav-link'}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar name={user.name} />
            <div className="sidebar-user-meta">
              <strong>{user.name}</strong>
              <span>{user.division?.name ?? 'Tanpa divisi'}</span>
            </div>
          </div>
          <div className="sidebar-user-actions">
            <RoleBadge role={user.role} />
            <button type="button" className="button button-ghost button-small" onClick={handleLogout}>
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="main-column">
        <header className="mobile-topbar">
          <button
            type="button"
            className="icon-button"
            aria-label="Buka menu"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
          <span className="mobile-brand">Pustipada Workhub</span>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1.5 1.5L7.5 5M4 12l1.5 1.5L7.5 11M4 18l1.5 1.5L7.5 17" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.8c1.9.6 3.2 2.4 3.2 4.7" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V6l6-2v16M10 20h10V10l-6-2" />
      <path d="M7 8v.01M7 12v.01M7 16v.01M14 12v.01M14 16v.01M17 12v.01M17 16v.01" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
