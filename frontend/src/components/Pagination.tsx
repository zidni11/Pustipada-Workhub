import type { PaginatedMeta } from '../types/api'
import styles from './Pagination.module.css'
import { ArrowLeftIcon, ArrowRightIcon } from './ui/Arrows'
import { Button } from './ui/Button'

interface PaginationProps {
  meta: PaginatedMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Navigasi halaman">
      <p className={styles.info}>
        Menampilkan <span className={styles.number}>{meta.from ?? 0}</span>
        <span aria-hidden="true">–</span>
        <span className={styles.number}>{meta.to ?? 0}</span> dari{' '}
        <span className={styles.number}>{meta.total}</span>
      </p>

      {meta.last_page > 1 ? (
        <div className={styles.controls}>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<ArrowLeftIcon />}
            disabled={meta.current_page <= 1}
            onClick={() => onPageChange(meta.current_page - 1)}
          >
            Sebelumnya
          </Button>
          <span className={styles.page} aria-current="page">
            <span className={styles.number}>{meta.current_page}</span>
            <span aria-hidden="true">/</span>
            <span>{meta.last_page}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => onPageChange(meta.current_page + 1)}
          >
            Berikutnya
            <ArrowRightIcon />
          </Button>
        </div>
      ) : null}
    </nav>
  )
}
