import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import styles from './DataTable.module.css'

export interface DataColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  label: string
  rows: T[]
  columns: Array<DataColumn<T>>
  getRowKey: (row: T) => string | number
  className?: string
}

export function DataTable<T>({
  label,
  rows,
  columns,
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn(styles.wrap, className)}>
      <table className={styles.table} aria-label={label}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(column.align === 'right' && styles.alignRight)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.header}
                  className={cn(column.align === 'right' && styles.alignRight)}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CellStack({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(styles.stack, className)}>{children}</span>
}

export function CellTitle({ children, href }: { children: ReactNode; href?: string }) {
  if (href) {
    return (
      <a className={styles.title} href={href}>
        {children}
      </a>
    )
  }

  return <span className={styles.title}>{children}</span>
}

export function CellMeta({ children }: { children: ReactNode }) {
  return <span className={styles.meta}>{children}</span>
}

export function CellPerson({ children }: { children: ReactNode }) {
  return <span className={styles.person}>{children}</span>
}

export function CellMono({ children }: { children: ReactNode }) {
  return <span className={styles.mono}>{children}</span>
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}
