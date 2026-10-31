import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './Surface.module.css'

export type SurfaceTag = 'div' | 'section' | 'article' | 'aside'
export type SurfaceTone = 'plain' | 'muted' | 'inset'
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg'

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: SurfaceTag
  tone?: SurfaceTone
  padding?: SurfacePadding
  children: ReactNode
}

export function Surface({
  as: Tag = 'div',
  tone = 'plain',
  padding = 'md',
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <Tag
      className={cn(styles.surface, styles[tone], styles[`padding-${padding}`], className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
