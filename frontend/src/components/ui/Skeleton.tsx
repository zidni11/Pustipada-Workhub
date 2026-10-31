import { cn } from '../../lib/cn'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  lines?: number
  width?: string
  height?: string
  className?: string
}

export function Skeleton({ lines = 1, width, height, className }: SkeletonProps) {
  return (
    <div className={cn(styles.stack, className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <span
          key={index}
          className={styles.bar}
          style={{
            width: width ?? (lines > 1 && index === lines - 1 ? '60%' : '100%'),
            height: height ?? '0.9rem',
          }}
        />
      ))}
    </div>
  )
}
