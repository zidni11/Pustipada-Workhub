import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './Notice.module.css'

interface NoticeProps {
  tone?: 'danger' | 'info' | 'success'
  className?: string
  children: ReactNode
}

export function Notice({ tone = 'danger', className, children }: NoticeProps) {
  return (
    <div
      className={cn(styles.notice, styles[tone], className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
