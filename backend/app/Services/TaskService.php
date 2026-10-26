<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TaskService
{
    /**
     * @var array<int, string>
     */
    private const DETAIL_RELATIONS = [
        'division',
        'creator.division',
        'pic.division',
        'members.division',
        'activities.user',
    ];

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(User $creator, array $attributes): Task
    {
        return DB::transaction(function () use ($creator, $attributes) {
            $memberIds = $attributes['member_ids'] ?? [];
            unset($attributes['member_ids']);

            $task = Task::create([
                ...$attributes,
                'creator_id' => $creator->id,
                'status' => TaskStatus::DRAFT,
                'priority' => $attributes['priority'] ?? 'medium',
            ]);

            $task->members()->sync($memberIds);

            $this->record($task, $creator, 'created', null, TaskStatus::DRAFT);

            return $task->load(self::DETAIL_RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Task $task, array $attributes): Task
    {
        return DB::transaction(function () use ($task, $attributes) {
            $memberIds = $attributes['member_ids'] ?? null;
            unset($attributes['member_ids']);

            $task->update($attributes);

            if ($memberIds !== null) {
                $task->members()->sync($memberIds);
            }

            return $task->refresh()->load(self::DETAIL_RELATIONS);
        });
    }

    public function transition(
        User $actor,
        Task $task,
        TaskStatus $status,
        ?string $note = null,
    ): Task {
        if (! $task->status->canTransitionTo($status)) {
            throw ValidationException::withMessages([
                'status' => [
                    "Transisi dari {$task->status->value} ke {$status->value} tidak diizinkan.",
                ],
            ]);
        }

        return DB::transaction(function () use ($actor, $task, $status, $note) {
            $from = $task->status;

            $task->update([
                'status' => $status,
                'completed_at' => $status === TaskStatus::COMPLETED ? now() : null,
            ]);

            $this->record($task, $actor, 'status_changed', $from, $status, $note);

            return $task->refresh()->load(self::DETAIL_RELATIONS);
        });
    }

    public function loadForDetail(Task $task): Task
    {
        return $task->load(self::DETAIL_RELATIONS);
    }

    private function record(
        Task $task,
        User $actor,
        string $action,
        ?TaskStatus $from,
        ?TaskStatus $to,
        ?string $note = null,
    ): void {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $actor->id,
            'action' => $action,
            'from_status' => $from,
            'to_status' => $to,
            'note' => $note,
        ]);
    }
}
