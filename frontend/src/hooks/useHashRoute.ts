import { useSyncExternalStore } from 'react'

export type AppRoute =
  | { name: 'dashboard' }
  | { name: 'tasks' }
  | { name: 'task'; id: number }
  | { name: 'users' }
  | { name: 'divisions' }
  | { name: 'notFound' }

export const routePaths = {
  dashboard: '/',
  tasks: '/tasks',
  task: (id: number) => `/tasks/${id}`,
  users: '/users',
  divisions: '/divisions',
}

function parseRoute(hash: string): AppRoute {
  const path = hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '')

  if (path === '') {
    return { name: 'dashboard' }
  }

  if (path === 'tasks') {
    return { name: 'tasks' }
  }

  const taskMatch = /^tasks\/(\d+)$/.exec(path)

  if (taskMatch) {
    return { name: 'task', id: Number(taskMatch[1]) }
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
