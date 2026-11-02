<?php

namespace Database\Factories;

use App\Enums\TaskSubmissionType;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskSubmission>
 */
class TaskSubmissionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'task_id' => Task::factory(),
            'user_id' => User::factory()->anggota(),
            'type' => TaskSubmissionType::LINK,
            'title' => fake()->sentence(3),
            'url' => fake()->url(),
            'file_path' => null,
            'original_name' => null,
            'mime_type' => null,
            'file_size' => null,
        ];
    }

    public function file(): static
    {
        return $this->state(fn () => [
            'type' => TaskSubmissionType::FILE,
            'url' => null,
            'file_path' => 'task-submissions/1/contoh.pdf',
            'original_name' => 'contoh.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
        ]);
    }
}
