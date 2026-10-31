import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './Button.module.css'

export type ButtonLinkVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonLinkSize = 'sm' | 'md'

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonLinkVariant
  size?: ButtonLinkSize
  leadingIcon?: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a className={cn(styles.button, styles[variant], styles[size], className)} {...rest}>
      {leadingIcon}
      <span>{children}</span>
    </a>
  )
}
