import type { ReactNode } from 'react'
import './App.css'
import { AccessDenied } from './components/AccessDenied'
import { AppLayout } from './components/AppLayout'
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
      <div className="app-loading">
        <span className="spinner" aria-hidden="true" />
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
      page = user.role === 'admin' ? <AccessDenied message="Admin tidak mengelola isi tugas." /> : <TasksPage />
      break
    case 'task':
      page = user.role === 'admin' ? <AccessDenied message="Admin tidak mengelola isi tugas." /> : <TaskDetailPage id={route.id} />
      break
    case 'users':
      page = user.role === 'admin' ? <UsersPage /> : <AccessDenied message="Hanya admin yang dapat mengelola pengguna." />
      break
    case 'divisions':
      page = user.role === 'admin' ? <DivisionsPage /> : <AccessDenied message="Hanya admin yang dapat mengelola divisi." />
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
    <div className="page-state">
      <strong>Halaman tidak ditemukan</strong>
      <p>Alamat yang Anda buka tidak tersedia.</p>
      <a className="button button-ghost" href="#/">
        Kembali ke dashboard
      </a>
    </div>
  )
}

export default App
