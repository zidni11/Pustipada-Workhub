<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignment_and_open_notifications_are_sent_to_assignees(): void
    {
        [$division, $pimpinan, $pic, $member] = $this->scenario();

        Sanctum::actingAs($pimpinan);

        $response = $this->postJson('/api/tasks', [
            'title' => 'Susun laporan',
            'division_id' => $division->id,
            'pic_id' => $pic->id,
            'member_ids' => [$member->id],
        ])->assertCreated();

        $taskId = $response->json('data.id');

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $pic->id,
            'type' => 'task_assigned',
            'target_url' => "#/tasks/{$taskId}",
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $member->id,
            'type' => 'task_assigned',
        ]);

        $this->patchJson("/api/tasks/{$taskId}/status", ['status' => 'open'])
            ->assertOk();

        $this->assertSame(
            2,
            UserNotification::query()
                ->where('user_id', $pic->id)
                ->where('type', 'task_assigned')
                ->count(),
        );
        $this->assertSame(
            2,
            UserNotification::query()
                ->where('user_id', $member->id)
                ->where('type', 'task_assigned')
                ->count(),
        );
    }

    public function test_assignment_update_notifies_only_new_assignees(): void
    {
        [$division, $pimpinan, $pic] = $this->scenario();
        $oldMember = User::factory()->anggota()->create(['division_id' => $division->id]);
        $newMember = User::factory()->anggota()->create(['division_id' => $division->id]);

        $task = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);
        $task->members()->attach($oldMember->id);

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}", [
            'member_ids' => [$oldMember->id, $newMember->id],
        ])->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $newMember->id,
            'type' => 'task_assigned',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $oldMember->id,
            'type' => 'task_assigned',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $pic->id,
            'type' => 'task_assigned',
        ]);
    }

    public function test_review_and_revision_notifications_reach_the_right_people(): void
    {
        [$division, $pimpinan, $pic, $member] = $this->scenario();

        $task = Task::factory()->forDivision($division)->status(TaskStatus::IN_PROGRESS)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);
        $task->members()->attach($member->id);

        Sanctum::actingAs($pic);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_review'])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $pimpinan->id,
            'type' => 'task_status_changed',
            'title' => 'Tugas menunggu review',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $pic->id,
            'type' => 'task_status_changed',
        ]);

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'revision_needed'])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $pic->id,
            'type' => 'task_status_changed',
            'title' => 'Revisi tugas diperlukan',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $member->id,
            'type' => 'task_status_changed',
            'title' => 'Revisi tugas diperlukan',
        ]);
    }

    public function test_completion_notifies_assignees(): void
    {
        [$division, $pimpinan, $pic, $member] = $this->scenario();

        $task = Task::factory()->forDivision($division)->status(TaskStatus::IN_REVIEW)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);
        $task->members()->attach($member->id);

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'completed'])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $pic->id,
            'type' => 'task_status_changed',
            'title' => 'Tugas selesai',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $member->id,
            'type' => 'task_status_changed',
            'title' => 'Tugas selesai',
        ]);
    }

    public function test_notifications_can_be_listed_marked_read_and_read_all(): void
    {
        $user = User::factory()->anggota()->create();
        $other = User::factory()->anggota()->create();

        $unread = UserNotification::factory()->for($user)->create();
        UserNotification::factory()->for($user)->create();
        UserNotification::factory()->for($user)->read()->create();
        $otherNotification = UserNotification::factory()->for($other)->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('unread_count', 2);

        $this->patchJson("/api/notifications/{$unread->id}/read")
            ->assertOk()
            ->assertJsonPath('data.read_at', fn ($value) => $value !== null);

        $this->patchJson("/api/notifications/{$otherNotification->id}/read")
            ->assertForbidden();

        $this->postJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $user->id,
            'read_at' => null,
        ]);
    }

    public function test_account_approval_sends_notification(): void
    {
        $admin = User::factory()->admin()->create();
        $inactive = User::factory()->anggota()->inactive()->create();

        Sanctum::actingAs($admin);

        $this->patchJson("/api/users/{$inactive->id}", ['is_active' => true])
            ->assertOk()
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $inactive->id,
            'type' => 'account_approved',
        ]);
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
