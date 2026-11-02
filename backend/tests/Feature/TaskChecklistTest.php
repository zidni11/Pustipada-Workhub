<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Task;
use App\Models\TaskChecklist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskChecklistTest extends TestCase
{
    use RefreshDatabase;

    public function test_pimpinan_can_add_toggle_and_delete_checklist(): void
    {
        [$task, $pimpinan] = $this->scenario();

        Sanctum::actingAs($pimpinan);

        $response = $this->postJson("/api/tasks/{$task->id}/checklists", [
            'title' => 'Siapkan bahan presentasi',
        ])->assertCreated()
            ->assertJsonPath('data.is_completed', false);

        $checklistId = $response->json('data.id');

        $this->patchJson("/api/tasks/{$task->id}/checklists/{$checklistId}")
            ->assertOk()
            ->assertJsonPath('data.is_completed', true)
            ->assertJsonPath('data.completed_by.id', $pimpinan->id);

        $this->patchJson("/api/tasks/{$task->id}/checklists/{$checklistId}")
            ->assertOk()
            ->assertJsonPath('data.is_completed', false)
            ->assertJsonPath('data.completed_by', null);

        $this->deleteJson("/api/tasks/{$task->id}/checklists/{$checklistId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('task_checklists', ['id' => $checklistId]);
    }

    public function test_supporting_member_can_toggle_but_only_pic_or_pimpinan_can_delete(): void
    {
        [$task, $pimpinan, $pic, $member] = $this->scenario(true);

        Sanctum::actingAs($member);

        $response = $this->postJson("/api/tasks/{$task->id}/checklists", [
            'title' => 'Cek daftar hadir',
        ])->assertCreated();

        $checklistId = $response->json('data.id');

        $this->patchJson("/api/tasks/{$task->id}/checklists/{$checklistId}")
            ->assertOk()
            ->assertJsonPath('data.is_completed', true);

        $this->deleteJson("/api/tasks/{$task->id}/checklists/{$checklistId}")
            ->assertForbidden();

        Sanctum::actingAs($pimpinan);

        $this->deleteJson("/api/tasks/{$task->id}/checklists/{$checklistId}")
            ->assertNoContent();

        $second = TaskChecklist::factory()->for($task)->create();
        $this->assertDatabaseHas('task_checklists', ['id' => $second->id]);

        Sanctum::actingAs($pic);

        $this->deleteJson("/api/tasks/{$task->id}/checklists/{$second->id}")
            ->assertNoContent();
    }

    public function test_unassigned_anggota_cannot_manage_checklist(): void
    {
        [$task] = $this->scenario();

        $outsider = User::factory()->anggota()->create([
            'division_id' => $task->division_id,
        ]);

        Sanctum::actingAs($outsider);

        $this->postJson("/api/tasks/{$task->id}/checklists", [
            'title' => 'Tidak boleh',
        ])->assertForbidden();
    }

    public function test_checklist_must_belong_to_task(): void
    {
        [$task, $pimpinan] = $this->scenario();
        $otherTask = Task::factory()->forDivision($task->division)->create([
            'creator_id' => $pimpinan->id,
        ]);
        $checklist = TaskChecklist::factory()->for($otherTask)->create();

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}/checklists/{$checklist->id}")
            ->assertNotFound();
    }

    /**
     * @return array{0: Task, 1: User, 2: User, 3: User}
     */
    private function scenario(bool $withMember = false): array
    {
        $division = Division::factory()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $division->id]);
        $pic = User::factory()->anggota()->create(['division_id' => $division->id]);
        $member = User::factory()->anggota()->create(['division_id' => $division->id]);

        $task = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);

        if ($withMember) {
            $task->members()->attach($member->id);
        }

        return [$task, $pimpinan, $pic, $member];
    }
}
