import { useSyncExternalStore } from 'react'

export type AppRoute =
  | { name: 'dashboard' }
  | { name: 'tasks'; create?: boolean }
  | { name: 'taskHistory' }
  | { name: 'task'; id: number }
  | { name: 'calendar'; month?: string; create?: boolean }
  | { name: 'users' }
  | { name: 'divisions' }
  | { name: 'notFound' }

export const routePaths = {
  dashboard: '/',
  tasks: '/tasks',
  taskHistory: '/task-history',
  taskNew: '/tasks/new',
  task: (id: number) => `/tasks/${id}`,
  calendar: '/calendar',
  calendarNew: '/calendar?new=1',
  calendarMonth: (month: string) => `/calendar?month=${encodeURIComponent(month)}`,
  users: '/users',
  divisions: '/divisions',
}

function parseRoute(hash: string): AppRoute {
  const raw = hash.replace(/^#/, '')
  const [rawPath, rawQuery] = raw.split('?')
  const path = rawPath.replace(/^\/+|\/+$/g, '')
  const query = new URLSearchParams(rawQuery ?? '')

  if (path === '') {
    return { name: 'dashboard' }
  }

  if (path === 'tasks') {
    return { name: 'tasks' }
  }

  if (path === 'tasks/history' || path === 'task-history') {
    return { name: 'taskHistory' }
  }

  if (path === 'tasks/new') {
    return { name: 'tasks', create: true }
  }

  const taskMatch = /^tasks\/(\d+)$/.exec(path)

  if (taskMatch) {
    return { name: 'task', id: Number(taskMatch[1]) }
  }

  if (path === 'calendar') {
    const month = query.get('month')
    const validMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : undefined

    return {
      name: 'calendar',
      month: validMonth,
      create: query.get('new') === '1',
    }
  }

  if (path === 'users') {
    return { name: 'users' }
  }

  if (path === 'divisions') {
    return { name: 'divisions' }
  }

  return { name: 'notFound' }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)

  return () => window.removeEventListener('hashchange', callback)
}

let cachedHash = window.location.hash
let cachedRoute = parseRoute(cachedHash)

function getSnapshot(): AppRoute {
  if (window.location.hash !== cachedHash) {
    cachedHash = window.location.hash
    cachedRoute = parseRoute(cachedHash)
  }

  return cachedRoute
}

export function navigate(path: string): void {
  const nextHash = path.startsWith('#') ? path : `#${path}`

  if (window.location.hash === nextHash) {
    return
  }

  window.location.hash = nextHash
}

export function useHashRoute(): AppRoute {
  return useSyncExternalStore(subscribe, getSnapshot)
}
