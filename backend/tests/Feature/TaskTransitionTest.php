<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskTransitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_pimpinan_can_complete_full_task_lifecycle(): void
    {
        [$pimpinan, $task] = $this->scenario();

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'open'])
            ->assertOk()
            ->assertJsonPath('data.status', 'open');

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_review'])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_review');

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.completed_at', fn ($value) => $value !== null);

        $this->assertDatabaseCount('task_activities', 4);
        $this->assertDatabaseHas('task_activities', [
            'task_id' => $task->id,
            'from_status' => 'in_review',
            'to_status' => 'completed',
        ]);
    }

    public function test_invalid_transition_is_rejected(): void
    {
        [$pimpinan, $task] = $this->scenario();

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'completed'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_anggota_cannot_approve_task(): void
    {
        [$pimpinan, $task] = $this->scenario(TaskStatus::IN_REVIEW);

        Sanctum::actingAs($task->pic);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'completed'])
            ->assertForbidden();
    }

    public function test_anggota_can_submit_task_for_review(): void
    {
        [$pimpinan, $task] = $this->scenario(TaskStatus::IN_PROGRESS);

        Sanctum::actingAs($task->pic);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_review'])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_review');
    }

    public function test_non_assigned_anggota_cannot_change_status(): void
    {
        [$pimpinan, $task] = $this->scenario(TaskStatus::OPEN);

        $otherAnggota = User::factory()->anggota()->create([
            'division_id' => $task->division_id,
        ]);

        Sanctum::actingAs($otherAnggota);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_progress'])
            ->assertForbidden();
    }

    public function test_revision_flow_returns_task_to_assignee(): void
    {
        [$pimpinan, $task] = $this->scenario(TaskStatus::IN_REVIEW);

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}/status", [
            'status' => 'revision_needed',
            'note' => 'Tambahkan daftar pustaka.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'revision_needed');

        $this->assertDatabaseHas('task_activities', [
            'task_id' => $task->id,
            'to_status' => 'revision_needed',
            'note' => 'Tambahkan daftar pustaka.',
        ]);

        Sanctum::actingAs($task->pic);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');
    }

    public function test_pimpinan_can_delete_task(): void
    {
        [$pimpinan, $task] = $this->scenario();

        Sanctum::actingAs($pimpinan);

        $this->deleteJson("/api/tasks/{$task->id}")->assertNoContent();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    /**
     * @return array{0: User, 1: Task}
     */
    private function scenario(TaskStatus $status = TaskStatus::DRAFT): array
    {
        $division = Division::factory()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $division->id]);
        $anggota = User::factory()->anggota()->create(['division_id' => $division->id]);

        $task = Task::factory()
            ->forDivision($division)
            ->status($status)
            ->create([
                'creator_id' => $pimpinan->id,
                'pic_id' => $anggota->id,
            ]);

        return [$pimpinan, $task->load('pic')];
    }
}
