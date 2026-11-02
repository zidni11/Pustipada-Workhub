import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { listDivisions } from '../api/divisions'
import {
  getTaskSummary,
  listAllTasks,
  listTasks,
} from '../api/tasks'
import { listAllUsers } from '../api/users'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { downloadTaskRecap } from '../lib/exports'
import { canManageTasks } from '../lib/tasks'
import type { TaskListParams, TaskStatus } from '../types/api'

export type AssignmentRole = '' | 'pic' | 'supporting'

export function useTaskHistory() {
  const { user } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [divisionId, setDivisionId] = useState('')
  const [picId, setPicId] = useState('')
  const [assignmentRole, setAssignmentRole] = useState<AssignmentRole>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const canManage = user ? canManageTasks(user) : false
  const isAnggota = user?.role === 'anggota'

  const filters: Omit<TaskListParams, 'page'> = {
    view_mode: 'all',
    date_field: 'created_at',
    search: search || undefined,
    status: status || undefined,
    division_id: divisionId ? Number(divisionId) : undefined,
    pic_id: picId ? Number(picId) : undefined,
    assignment_role: assignmentRole || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const summary = useAsync(() => getTaskSummary(), [])
  const divisions = useAsync(() => listDivisions(), [])
  const users = useAsync(
    () => (canManage ? listAllUsers() : Promise.resolve([])),
    [canManage],
  )
  const tasks = useAsync(
    () => listTasks({ ...filters, page }),
    [
      search,
      status,
      divisionId,
      picId,
      assignmentRole,
      dateFrom,
      dateTo,
      page,
    ],
  )

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const changeStatus = (value: TaskStatus | '') => {
    setStatus(value)
    setPage(1)
  }

  const changeDivision = (value: string) => {
    setDivisionId(value)
    setPage(1)
  }

  const changePic = (value: string) => {
    setPicId(value)
    setPage(1)
  }

  const changeAssignmentRole = (value: AssignmentRole) => {
    setAssignmentRole(value)
    setPage(1)
  }

  const changeDateFrom = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const changeDateTo = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  const resetFilters = () => {
    setStatus('')
    setDivisionId('')
    setPicId('')
    setAssignmentRole('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setSearchInput('')
    setPage(1)
  }

  const exportRecap = async () => {
    setExporting(true)
    setExportError(null)

    try {
      const allTasks = await listAllTasks(filters)
      downloadTaskRecap(allTasks)
    } catch (error) {
      setExportError(getErrorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  const activeFilterCount = [
    status,
    divisionId,
    picId,
    assignmentRole,
    dateFrom,
    dateTo,
    search,
  ].filter(Boolean).length

  return {
    canManage,
    isAnggota,
    divisions: divisions.data?.data ?? [],
    users: users.data ?? [],
    summary,
    tasks,
    searchInput,
    setSearchInput,
    handleSearch,
    status,
    changeStatus,
    divisionId,
    changeDivision,
    picId,
    changePic,
    assignmentRole,
    changeAssignmentRole,
    dateFrom,
    changeDateFrom,
    dateTo,
    changeDateTo,
    activeFilterCount,
    resetFilters,
    page,
    setPage,
    exporting,
    exportError,
    exportRecap,
  }
}
