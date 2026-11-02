import type { Task } from '../types/api'

export type ExportFormat = 'csv' | 'json'

export function downloadTasks(
  tasks: Task[],
  view: 'active' | 'history',
  format: ExportFormat,
): void {
  const stamp = new Date().toISOString().slice(0, 10)
  const baseName = `tugas-${view}-${stamp}`

  if (format === 'json') {
    download(
      `${baseName}.json`,
      JSON.stringify(tasks, null, 2),
      'application/json;charset=utf-8',
    )
    return
  }

  download(
    `${baseName}.csv`,
    `\uFEFF${buildTaskCsv(tasks)}`,
    'text/csv;charset=utf-8',
  )
}

export function downloadTaskRecap(tasks: Task[]): void {
  const stamp = new Date().toISOString().slice(0, 10)

  download(
    `rekap-tugas-${stamp}.csv`,
    `\uFEFF${buildTaskCsv(tasks)}`,
    'text/csv;charset=utf-8',
  )
}

function buildTaskCsv(tasks: Task[]): string {
  const headers = [
    'ID',
    'Judul',
    'Deskripsi',
    'Status',
    'Prioritas',
    'Divisi',
    'PIC',
    'Anggota Pendukung',
    'Tenggat',
    'Selesai',
    'Dibuat',
    'Diperbarui',
  ]

  const rows = tasks.map((task) => [
    task.id,
    task.title,
    task.description ?? '',
    task.status,
    task.priority,
    task.division?.name ?? '',
    task.pic?.name ?? '',
    (task.members ?? []).map((member) => member.name).join('; '),
    task.due_date ?? '',
    task.completed_at ?? '',
    task.created_at ?? '',
    task.updated_at ?? '',
  ])

  return [headers, ...rows]
    .map((row) => row.map((value) => escapeCell(String(value))).join(','))
    .join('\r\n')
}

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
