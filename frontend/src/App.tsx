import type { ReactNode } from 'react'
import styles from './App.module.css'
import { AccessDenied } from './components/AccessDenied'
import { AppLayout } from './components/layout/AppLayout'
import { EmptyState } from './components/PageState'
import { ButtonLink } from './components/ui/ButtonLink'
import { Surface } from './components/ui/Surface'
import { useAuth } from './hooks/useAuth'
import { useHashRoute } from './hooks/useHashRoute'
import { DashboardPage } from './pages/DashboardPage'
import { DivisionsPage } from './pages/DivisionsPage'
import { LoginPage } from './pages/LoginPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { TasksPage } from './pages/TasksPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  const { user, loading } = useAuth()
  const route = useHashRoute()

  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-label="Memuat sesi">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Memuat sesi...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  let page: ReactNode

  switch (route.name) {
    case 'dashboard':
      page = <DashboardPage />
      break
    case 'tasks':
      page =
        user.role === 'admin' ? (
          <AccessDenied message="Admin tidak mengelola isi tugas." />
        ) : (
          <TasksPage />
        )
      break
    case 'task':
      page =
        user.role === 'admin' ? (
          <AccessDenied message="Admin tidak mengelola isi tugas." />
        ) : (
          <TaskDetailPage id={route.id} />
        )
      break
    case 'users':
      page =
        user.role === 'admin' ? (
          <UsersPage />
        ) : (
          <AccessDenied message="Hanya admin yang dapat mengelola pengguna." />
        )
      break
    case 'divisions':
      page =
        user.role === 'admin' ? (
          <DivisionsPage />
        ) : (
          <AccessDenied message="Hanya admin yang dapat mengelola divisi." />
        )
      break
    default:
      page = <NotFound />
  }

  return (
    <AppLayout user={user} route={route}>
      {page}
    </AppLayout>
  )
}

function NotFound() {
  return (
    <Surface padding="none">
      <EmptyState
        titleAs="h1"
        title="Halaman tidak ditemukan"
        description="Alamat yang Anda buka tidak tersedia."
        action={
          <ButtonLink href="#/" variant="secondary" size="sm">
            Kembali ke dashboard
          </ButtonLink>
        }
      />
    </Surface>
  )
}

export default App
