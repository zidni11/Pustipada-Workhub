import type { PaginatedMeta } from '../types/api'

interface PaginationProps {
  meta: PaginatedMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.last_page <= 1) {
    return null
  }

  return (
    <div className="pagination">
      <span className="pagination-info">
        Menampilkan {meta.from ?? 0}-{meta.to ?? 0} dari {meta.total}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="button button-ghost"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Sebelumnya
        </button>
        <span className="pagination-page">
          {meta.current_page} / {meta.last_page}
        </span>
        <button
          type="button"
          className="button button-ghost"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}
