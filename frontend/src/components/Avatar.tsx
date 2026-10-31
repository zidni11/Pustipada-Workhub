import { cn } from '../lib/cn'
import { initials } from '../lib/format'
import styles from './Avatar.module.css'

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn(styles.avatar, className)} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
