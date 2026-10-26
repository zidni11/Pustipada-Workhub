export function AccessDenied({ message = 'Halaman ini tidak tersedia untuk peran Anda.' }: { message?: string }) {
  return (
    <div className="page-state page-state-error">
      <strong>Akses ditolak</strong>
      <p>{message}</p>
      <a className="button button-ghost" href="#/">
        Kembali ke dashboard
      </a>
    </div>
  )
}
