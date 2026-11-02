import { PageHeader } from '../components/PageHeader'
import { Notice } from '../components/ui/Notice'
import { Surface } from '../components/ui/Surface'
import { HistoryIcon } from '../components/layout/icons'
import { TaskHistoryExportButton } from '../components/tasks/history/TaskHistoryExportButton'
import { TaskHistoryFilters } from '../components/tasks/history/TaskHistoryFilters'
import { TaskHistorySummary } from '../components/tasks/history/TaskHistorySummary'
import { TaskHistoryTable } from '../components/tasks/history/TaskHistoryTable'
import { useTaskHistory } from '../composables/useTaskHistory'
import styles from './TaskHistoryPage.module.css'

export function TaskHistoryPage() {
  const history = useTaskHistory()

  return (
    <>
      <PageHeader
        icon={<HistoryIcon />}
        title="Riwayat Tugas"
        description="Rekap seluruh tugas lintas status untuk meninjau perjalanan pekerjaan."
        actions={
          <TaskHistoryExportButton
            exporting={history.exporting}
            onExport={() => void history.exportRecap()}
          />
        }
      />

      {history.exportError ? (
        <Notice className={styles.notice}>{history.exportError}</Notice>
      ) : null}

      <TaskHistorySummary
        data={history.summary.data}
        loading={history.summary.loading}
        error={history.summary.error}
      />

      <Surface padding="none">
        <TaskHistoryFilters
          query={history.searchInput}
          onQueryChange={history.setSearchInput}
          onSearch={history.handleSearch}
          status={history.status}
          onStatusChange={history.changeStatus}
          divisions={history.divisions}
          divisionId={history.divisionId}
          onDivisionChange={history.changeDivision}
          users={history.users}
          canManagePic={history.canManage}
          picId={history.picId}
          onPicChange={history.changePic}
          showAssignmentRole={history.isAnggota}
          assignmentRole={history.assignmentRole}
          onAssignmentRoleChange={history.changeAssignmentRole}
          dateFrom={history.dateFrom}
          onDateFromChange={history.changeDateFrom}
          dateTo={history.dateTo}
          onDateToChange={history.changeDateTo}
          activeFilterCount={history.activeFilterCount}
          onReset={history.resetFilters}
        />

        <TaskHistoryTable
          data={history.tasks.data}
          loading={history.tasks.loading}
          error={history.tasks.error}
          onRetry={history.tasks.reload}
          onPageChange={history.setPage}
        />
      </Surface>
    </>
  )
}
