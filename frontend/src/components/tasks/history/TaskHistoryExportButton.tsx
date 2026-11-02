import { Button } from '../../ui/Button'

interface TaskHistoryExportButtonProps {
  exporting: boolean
  onExport: () => void
}

export function TaskHistoryExportButton({
  exporting,
  onExport,
}: TaskHistoryExportButtonProps) {
  return (
    <Button
      variant="secondary"
      disabled={exporting}
      onClick={onExport}
      aria-busy={exporting}
    >
      {exporting ? 'Menyiapkan...' : 'Ekspor CSV'}
    </Button>
  )
}
