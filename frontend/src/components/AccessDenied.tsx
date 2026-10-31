import { EmptyState } from './PageState'
import { ButtonLink } from './ui/ButtonLink'
import { Surface } from './ui/Surface'

export function AccessDenied({
  message = 'Halaman ini tidak tersedia untuk peran Anda.',
}: {
  message?: string
}) {
  return (
    <Surface padding="none">
      <EmptyState
        titleAs="h1"
        title="Akses ditolak"
        description={message}
        action={
          <ButtonLink href="#/" variant="secondary" size="sm">
            Kembali ke dashboard
          </ButtonLink>
        }
      />
    </Surface>
  )
}
