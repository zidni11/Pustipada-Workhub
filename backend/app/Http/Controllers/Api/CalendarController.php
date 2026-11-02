<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CalendarTaskResource;
use App\Http\Resources\CommunityEventResource;
use App\Models\CommunityEvent;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CalendarController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => ['sometimes', 'date_format:Y-m'],
        ]);

        $month = $data['month'] ?? now()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $user = $request->user();

        $canViewTasks = $user->can('viewAny', Task::class);

        $tasks = $canViewTasks
            ? Task::query()
                ->visibleTo($user)
                ->with(['division', 'pic'])
                ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()])
                ->orderBy('due_date')
                ->get()
            : collect();

        $events = CommunityEvent::query()
            ->visibleTo($user)
            ->with(['division', 'creator'])
            ->where('start_at', '<=', $end)
            ->where(function ($query) use ($start) {
                $query->where('start_at', '>=', $start)
                    ->orWhere('end_at', '>=', $start);
            })
            ->orderBy('start_at')
            ->get();

        $reminderStart = now()->startOfDay();
        $reminderEnd = now()->addDays(7)->endOfDay();

        $reminderTasks = $canViewTasks
            ? Task::query()
                ->visibleTo($user)
                ->whereBetween('due_date', [
                    $reminderStart->toDateString(),
                    $reminderEnd->toDateString(),
                ])
                ->orderBy('due_date')
                ->get()
            : collect();

        $reminderEvents = CommunityEvent::query()
            ->visibleTo($user)
            ->whereBetween('start_at', [$reminderStart, $reminderEnd])
            ->orderBy('start_at')
            ->get();

        $reminders = collect()
            ->merge($reminderTasks->map(fn (Task $task) => [
                'type' => 'task',
                'id' => $task->id,
                'title' => $task->title,
                'date' => $task->due_date?->toDateString(),
                'label' => $task->status->label(),
                'target_url' => "#/tasks/{$task->id}",
            ]))
            ->merge($reminderEvents->map(fn (CommunityEvent $event) => [
                'type' => 'event',
                'id' => $event->id,
                'title' => $event->title,
                'date' => $event->start_at?->toIso8601String(),
                'label' => $event->category->label(),
                'target_url' => '#/calendar?month='.$event->start_at?->format('Y-m'),
            ]))
            ->sortBy('date')
            ->values()
            ->all();

        return response()->json([
            'month' => $month,
            'tasks' => CalendarTaskResource::collection($tasks),
            'events' => CommunityEventResource::collection($events),
            'upcoming_reminders' => $reminders,
        ]);
    }
}
