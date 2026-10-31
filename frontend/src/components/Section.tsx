import { useId, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Surface } from './ui/Surface'
import styles from './Section.module.css'

interface SectionProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function Section({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: SectionProps) {
  const titleId = useId()

  return (
    <Surface as="section" padding="none" className={className} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {action ? <div className={styles.action}>{action}</div> : null}
      </header>
      <div className={cn(styles.body, bodyClassName)}>{children}</div>
    </Surface>
  )
}
