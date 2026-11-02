<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Models\Division;
use App\Models\Task;
use App\Models\TaskChecklist;
use App\Models\TaskSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_anggota_can_filter_by_assignment_role(): void
    {
        [$division, $pimpinan, $pic, $member] = $this->scenario();

        $picTask = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);

        $supportingTask = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => User::factory()->anggota()->create(['division_id' => $division->id])->id,
        ]);
        $supportingTask->members()->attach($member->id);

        $unassignedTask = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
        ]);

        Sanctum::actingAs($member);

        $supportingResponse = $this->getJson('/api/tasks?view_mode=all&assignment_role=supporting')->assertOk();
        $supportingIds = collect($supportingResponse->json('data'))->pluck('id');

        $this->assertTrue($supportingIds->contains($supportingTask->id));
        $this->assertFalse($supportingIds->contains($picTask->id));
        $this->assertFalse($supportingIds->contains($unassignedTask->id));

        Sanctum::actingAs($pic);

        $picResponse = $this->getJson('/api/tasks?view_mode=all&assignment_role=pic')->assertOk();
        $picIds = collect($picResponse->json('data'))->pluck('id');

        $this->assertTrue($picIds->contains($picTask->id));
        $this->assertFalse($picIds->contains($supportingTask->id));
    }

    public function test_history_view_and_date_range_use_completion_or_archive_date(): void
    {
        [$division, $pimpinan] = $this->scenario();

        $recentCompleted = Task::factory()->forDivision($division)->status(TaskStatus::COMPLETED)->create([
            'creator_id' => $pimpinan->id,
            'completed_at' => now()->subDays(2),
        ]);

        $oldCompleted = Task::factory()->forDivision($division)->status(TaskStatus::COMPLETED)->create([
            'creator_id' => $pimpinan->id,
            'completed_at' => now()->subDays(20),
        ]);

        $recentCancelled = Task::factory()->forDivision($division)->status(TaskStatus::CANCELLED)->create([
            'creator_id' => $pimpinan->id,
            'updated_at' => now()->subDay(),
        ]);

        $active = Task::factory()->forDivision($division)->status(TaskStatus::IN_PROGRESS)->create([
            'creator_id' => $pimpinan->id,
        ]);

        Sanctum::actingAs($pimpinan);

        $historyResponse = $this->getJson(
            '/api/tasks?view_mode=history&date_from='.now()->subDays(7)->toDateString().
            '&date_to='.now()->toDateString(),
        )->assertOk();

        $historyIds = collect($historyResponse->json('data'))->pluck('id');

        $this->assertTrue($historyIds->contains($recentCompleted->id));
        $this->assertTrue($historyIds->contains($recentCancelled->id));
        $this->assertFalse($historyIds->contains($oldCompleted->id));
        $this->assertFalse($historyIds->contains($active->id));

        $activeResponse = $this->getJson('/api/tasks?view_mode=active')->assertOk();
        $activeIds = collect($activeResponse->json('data'))->pluck('id');

        $this->assertTrue($activeIds->contains($active->id));
        $this->assertFalse($activeIds->contains($recentCompleted->id));
        $this->assertFalse($activeIds->contains($recentCancelled->id));
    }

    public function test_all_view_returns_every_status_and_supports_recap_filters(): void
    {
        [$division, $pimpinan] = $this->scenario();
        $otherDivision = Division::factory()->create();
        $createdAt = now()->subDays(5);

        $statusTasks = [];

        foreach (TaskStatus::cases() as $status) {
            $task = Task::factory()->forDivision($division)->status($status)->create([
                'creator_id' => $pimpinan->id,
            ]);
            $task->forceFill(['created_at' => $createdAt])->saveQuietly();
            $statusTasks[$status->value] = $task;
        }

        $oldTask = Task::factory()->forDivision($division)->status(TaskStatus::DRAFT)->create([
            'creator_id' => $pimpinan->id,
            'title' => 'Laporan lama',
        ]);
        $oldTask->forceFill(['created_at' => now()->subDays(40)])->saveQuietly();

        $otherDivisionTask = Task::factory()->forDivision($otherDivision)->status(TaskStatus::OPEN)->create([
            'creator_id' => $pimpinan->id,
        ]);
        $otherDivisionTask->forceFill(['created_at' => $createdAt])->saveQuietly();

        Sanctum::actingAs($pimpinan);

        $allResponse = $this->getJson('/api/tasks?view_mode=all&per_page=100')->assertOk();
        $allIds = collect($allResponse->json('data'))->pluck('id');

        foreach ($statusTasks as $task) {
            $this->assertTrue($allIds->contains($task->id));
        }

        $this->assertTrue($allIds->contains($oldTask->id));
        $this->assertTrue($allIds->contains($otherDivisionTask->id));

        $recentResponse = $this->getJson(
            '/api/tasks?view_mode=all&date_field=created_at&date_from='.
            now()->subDays(10)->toDateString().
            '&date_to='.now()->toDateString().'&per_page=100',
        )->assertOk();
        $recentIds = collect($recentResponse->json('data'))->pluck('id');

        foreach ($statusTasks as $task) {
            $this->assertTrue($recentIds->contains($task->id));
        }

        $this->assertFalse($recentIds->contains($oldTask->id));
        $this->assertTrue($recentIds->contains($otherDivisionTask->id));

        $completedResponse = $this->getJson(
            '/api/tasks?view_mode=all&status=completed&per_page=100',
        )->assertOk();

        $completedIds = collect($completedResponse->json('data'))->pluck('id');

        $this->assertTrue($completedIds->contains($statusTasks[TaskStatus::COMPLETED->value]->id));
        $this->assertFalse($completedIds->contains($statusTasks[TaskStatus::IN_PROGRESS->value]->id));

        $divisionResponse = $this->getJson(
            '/api/tasks?view_mode=all&division_id='.$otherDivision->id.'&per_page=100',
        )->assertOk();

        $divisionIds = collect($divisionResponse->json('data'))->pluck('id');

        $this->assertTrue($divisionIds->contains($otherDivisionTask->id));
        $this->assertFalse($divisionIds->contains($statusTasks[TaskStatus::DRAFT->value]->id));

        $searchResponse = $this->getJson(
            '/api/tasks?view_mode=all&date_field=created_at&search=Laporan&per_page=100',
        )->assertOk();

        $searchIds = collect($searchResponse->json('data'))->pluck('id');

        $this->assertTrue($searchIds->contains($oldTask->id));

        $oldRangeResponse = $this->getJson(
            '/api/tasks?view_mode=all&date_field=created_at&date_from='.
            now()->subDays(10)->toDateString().
            '&date_to='.now()->toDateString().'&search=Laporan&per_page=100',
        )->assertOk();

        $this->assertCount(0, collect($oldRangeResponse->json('data')));
    }

    public function test_task_resource_includes_checklists_progress_and_restricted_submissions(): void
    {
        [$division, $pimpinan, $pic] = $this->scenario();
        $outsider = User::factory()->anggota()->create(['division_id' => $division->id]);

        $task = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);

        TaskChecklist::factory()->for($task)->create(['title' => 'Siapkan bahan']);
        TaskChecklist::factory()->for($task)->completed()->create([
            'title' => 'Kumpulkan data',
            'completed_by' => $pic->id,
        ]);
        TaskSubmission::factory()->for($task)->create([
            'user_id' => $pic->id,
            'title' => 'Tautan hasil',
        ]);

        Sanctum::actingAs($pic);

        $this->getJson("/api/tasks/{$task->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.checklists')
            ->assertJsonPath('data.checklist_progress.total', 2)
            ->assertJsonPath('data.checklist_progress.completed', 1)
            ->assertJsonPath('data.checklist_progress.percentage', 50)
            ->assertJsonCount(1, 'data.submissions');

        Sanctum::actingAs($outsider);

        $this->getJson("/api/tasks/{$task->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.checklists')
            ->assertJsonCount(0, 'data.submissions');
    }

    /**
     * @return array{0: Division, 1: User, 2: User, 3: User}
     */
    private function scenario(): array
    {
        $division = Division::factory()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $division->id]);
        $pic = User::factory()->anggota()->create(['division_id' => $division->id]);
        $member = User::factory()->anggota()->create(['division_id' => $division->id]);

        return [$division, $pimpinan, $pic, $member];
    }
}
