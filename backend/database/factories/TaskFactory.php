<?php

namespace Database\Factories;

use App\Enums\TaskStatus;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status' => TaskStatus::DRAFT,
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'division_id' => Division::factory(),
            'creator_id' => User::factory()->pimpinan(),
            'pic_id' => null,
            'due_date' => fake()->dateTimeBetween('now', '+1 month'),
            'completed_at' => null,
        ];
    }

    public function status(TaskStatus $status): static
    {
        return $this->state(fn () => [
            'status' => $status,
            'completed_at' => $status === TaskStatus::COMPLETED ? now() : null,
        ]);
    }

    public function assignedTo(User $user): static
    {
        return $this->state(fn () => [
            'pic_id' => $user->id,
            'division_id' => $user->division_id,
        ]);
    }

    public function forDivision(Division $division): static
    {
        return $this->state(fn () => [
            'division_id' => $division->id,
        ]);
    }
}
