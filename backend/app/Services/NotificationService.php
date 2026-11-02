<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\CommunityEvent;
use App\Models\Task;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * @param  array<int, int>  $userIds
     */
    public function taskAssigned(
        Task $task,
        User $actor,
        array $userIds,
        ?string $title = null,
        ?string $message = null,
    ): void {
        $recipients = User::query()
            ->whereIn('id', $userIds)
            ->where('is_active', true)
            ->where('id', '!=', $actor->id)
            ->get();

        $this->notifyMany(
            $recipients,
            NotificationType::TASK_ASSIGNED,
            $title ?? 'Penugasan tugas',
            $message ?? "Anda terlibat dalam tugas \"{$task->title}\".",
            "#/tasks/{$task->id}",
        );
    }

    public function taskStatusChanged(Task $task, TaskStatus $status, User $actor): void
    {
        $recipientIds = match ($status) {
            TaskStatus::IN_REVIEW => [$task->creator_id],
            TaskStatus::REVISION_NEEDED => $this->assigneeIds($task),
            TaskStatus::COMPLETED => [
                $task->creator_id,
                ...$this->assigneeIds($task),
            ],
            default => [],
        };

        $recipients = User::query()
            ->whereIn('id', array_values(array_unique($recipientIds)))
            ->where('is_active', true)
            ->where('id', '!=', $actor->id)
            ->get();

        [$title, $message] = match ($status) {
            TaskStatus::IN_REVIEW => [
                'Tugas menunggu review',
                "{$actor->name} mengajukan \"{$task->title}\" untuk review.",
            ],
            TaskStatus::REVISION_NEEDED => [
                'Revisi tugas diperlukan',
                "{$actor->name} meminta revisi pada \"{$task->title}\".",
            ],
            TaskStatus::COMPLETED => [
                'Tugas selesai',
                "\"{$task->title}\" telah diselesaikan.",
            ],
            default => ['Status tugas berubah', "Status \"{$task->title}\" menjadi {$status->label()}."],
        };

        $this->notifyMany(
            $recipients,
            NotificationType::TASK_STATUS_CHANGED,
            $title,
            $message,
            "#/tasks/{$task->id}",
        );
    }

    public function eventCreated(CommunityEvent $event, User $actor): void
    {
        $query = User::query()
            ->where('is_active', true)
            ->where('id', '!=', $actor->id);

        if ($event->division_id !== null) {
            $query->where(function ($query) use ($event) {
                $query->where('division_id', $event->division_id)
                    ->orWhereIn('role', [UserRole::ADMIN, UserRole::PIMPINAN]);
            });
        }

        $this->notifyMany(
            $query->get(),
            NotificationType::EVENT_CREATED,
            'Acara baru',
            "\"{$event->title}\" dijadwalkan pada {$event->start_at?->format('d/m/Y H:i')}.",
            '#/calendar?month='.$event->start_at?->format('Y-m'),
        );
    }

    public function accountApproved(User $user): void
    {
        UserNotification::create([
            'user_id' => $user->id,
            'type' => NotificationType::ACCOUNT_APPROVED,
            'title' => 'Akun Anda telah aktif',
            'message' => 'Akun Workhub Anda sudah diaktifkan. Silakan masuk dan mulai berkolaborasi.',
            'target_url' => '#/',
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function assigneeIds(Task $task): array
    {
        return $task->assigneeIds();
    }

    private function notifyMany(
        Collection $recipients,
        NotificationType $type,
        string $title,
        string $message,
        ?string $targetUrl,
    ): void {
        foreach ($recipients->unique('id') as $recipient) {
            UserNotification::create([
                'user_id' => $recipient->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'target_url' => $targetUrl,
            ]);
        }
    }
}
