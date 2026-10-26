<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_pimpinan_can_see_all_tasks(): void
    {
        $pimpinan = User::factory()->pimpinan()->create();
        Task::factory()->count(3)->create(['creator_id' => $pimpinan->id]);

        Sanctum::actingAs($pimpinan);

        $this->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_anggota_only_sees_tasks_from_own_division_or_assigned_to_them(): void
    {
        $divisionA = Division::factory()->create();
        $divisionB = Division::factory()->create();

        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $divisionA->id]);
        $anggotaA = User::factory()->anggota()->create(['division_id' => $divisionA->id]);
        $anggotaB = User::factory()->anggota()->create(['division_id' => $divisionB->id]);

        $taskDivisionA = Task::factory()->forDivision($divisionA)->create(['creator_id' => $pimpinan->id]);
        $taskDivisionB = Task::factory()->forDivision($divisionB)->create(['creator_id' => $pimpinan->id]);
        $assignedFromB = Task::factory()
            ->forDivision($divisionB)
            ->create(['creator_id' => $pimpinan->id, 'pic_id' => $anggotaA->id]);

        Sanctum::actingAs($anggotaA);

        $response = $this->getJson('/api/tasks')->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        $this->assertTrue($ids->contains($taskDivisionA->id));
        $this->assertTrue($ids->contains($assignedFromB->id));
        $this->assertFalse($ids->contains($taskDivisionB->id));
        $this->assertCount(2, $ids);
    }

    public function test_anggota_cannot_view_task_outside_their_division(): void
    {
        $divisionA = Division::factory()->create();
        $divisionB = Division::factory()->create();

        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $divisionA->id]);
        $anggotaA = User::factory()->anggota()->create(['division_id' => $divisionA->id]);

        $taskB = Task::factory()->forDivision($divisionB)->create(['creator_id' => $pimpinan->id]);

        Sanctum::actingAs($anggotaA);

        $this->getJson("/api/tasks/{$taskB->id}")->assertForbidden();
        $this->assertNotSame($divisionA->id, $divisionB->id);
    }

    public function test_anggota_cannot_edit_task_details(): void
    {
        $division = Division::factory()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $division->id]);
        $anggota = User::factory()->anggota()->create(['division_id' => $division->id]);

        $task = Task::factory()
            ->forDivision($division)
            ->create(['creator_id' => $pimpinan->id, 'pic_id' => $anggota->id]);

        Sanctum::actingAs($anggota);

        $this->patchJson("/api/tasks/{$task->id}", [
            'title' => 'Judul diubah anggota',
        ])->assertForbidden();
    }
}
