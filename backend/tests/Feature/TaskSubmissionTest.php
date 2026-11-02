<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_pic_and_supporting_member_can_upload_proof(): void
    {
        Storage::fake('public');

        [$task, $pic, $member] = $this->scenario();

        Sanctum::actingAs($member);

        $this->post("/api/tasks/{$task->id}/submissions", [
            'type' => 'file',
            'title' => 'Bukti pekerjaan',
            'file' => UploadedFile::fake()->create('bukti.pdf', 120, 'application/pdf'),
        ])->assertCreated()
            ->assertJsonPath('data.type', 'file')
            ->assertJsonPath('data.user.id', $member->id);

        $fileSubmission = TaskSubmission::query()->where('user_id', $member->id)->firstOrFail();

        Storage::disk('public')->assertExists($fileSubmission->file_path);

        Sanctum::actingAs($pic);

        $this->postJson("/api/tasks/{$task->id}/submissions", [
            'type' => 'link',
            'title' => 'Tautan hasil',
            'url' => 'https://example.com/hasil',
        ])->assertCreated()
            ->assertJsonPath('data.url', 'https://example.com/hasil');

        Sanctum::actingAs($this->pimpinanFor($task));

        $this->getJson("/api/tasks/{$task->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.submissions');
    }

    public function test_only_pic_can_delete_submission(): void
    {
        Storage::fake('public');

        [$task, $pic, $member] = $this->scenario();

        Sanctum::actingAs($member);

        $this->post("/api/tasks/{$task->id}/submissions", [
            'type' => 'file',
            'title' => 'Bukti anggota',
            'file' => UploadedFile::fake()->create('bukti.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $submission = TaskSubmission::query()->where('user_id', $member->id)->firstOrFail();

        Sanctum::actingAs($member);

        $this->deleteJson("/api/tasks/{$task->id}/submissions/{$submission->id}")
            ->assertForbidden();

        Sanctum::actingAs($this->pimpinanFor($task));

        $this->deleteJson("/api/tasks/{$task->id}/submissions/{$submission->id}")
            ->assertForbidden();

        Sanctum::actingAs($pic);

        $this->deleteJson("/api/tasks/{$task->id}/submissions/{$submission->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('task_submissions', ['id' => $submission->id]);
        Storage::disk('public')->assertMissing($submission->file_path);
    }

    public function test_unassigned_anggota_cannot_upload_proof(): void
    {
        [$task] = $this->scenario();

        $outsider = User::factory()->anggota()->create([
            'division_id' => $task->division_id,
        ]);

        Sanctum::actingAs($outsider);

        $this->postJson("/api/tasks/{$task->id}/submissions", [
            'type' => 'link',
            'title' => 'Tautan',
            'url' => 'https://example.com',
        ])->assertForbidden();
    }

    public function test_submission_payload_is_validated(): void
    {
        [$task, $pic] = $this->scenario();

        Sanctum::actingAs($pic);

        $this->postJson("/api/tasks/{$task->id}/submissions", [
            'type' => 'link',
            'title' => 'Tanpa URL',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('url');

        $this->postJson("/api/tasks/{$task->id}/submissions", [
            'type' => 'file',
            'title' => 'Tanpa file',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    /**
     * @return array{0: Task, 1: User, 2: User}
     */
    private function scenario(): array
    {
        $division = Division::factory()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $division->id]);
        $pic = User::factory()->anggota()->create(['division_id' => $division->id]);
        $member = User::factory()->anggota()->create(['division_id' => $division->id]);

        $task = Task::factory()->forDivision($division)->create([
            'creator_id' => $pimpinan->id,
            'pic_id' => $pic->id,
        ]);
        $task->members()->attach($member->id);

        return [$task, $pic, $member];
    }

    private function pimpinanFor(Task $task): User
    {
        return User::query()->findOrFail($task->creator_id);
    }
}
