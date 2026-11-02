import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'
import { IconBadge } from './ui/IconBadge'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        {icon ? (
          <IconBadge tone="info" className={styles.icon}>
            {icon}
          </IconBadge>
        ) : null}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
