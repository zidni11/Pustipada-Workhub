<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskChecklistRequest;
use App\Http\Resources\TaskChecklistResource;
use App\Models\Task;
use App\Models\TaskChecklist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskChecklistController extends Controller
{
    public function store(StoreTaskChecklistRequest $request, Task $task): JsonResponse
    {
        $this->authorize('manageChecklist', $task);

        $checklist = $task->checklists()->create([
            'title' => $request->validated('title'),
            'is_completed' => false,
        ]);

        return (new TaskChecklistResource($checklist->load('completedBy')))
            ->response()
            ->setStatusCode(201);
    }

    public function toggle(Request $request, Task $task, TaskChecklist $checklist): TaskChecklistResource
    {
        abort_unless($checklist->task_id === $task->id, 404);

        $this->authorize('manageChecklist', $task);

        $completed = ! $checklist->is_completed;

        $checklist->update([
            'is_completed' => $completed,
            'completed_by' => $completed ? $request->user()->id : null,
            'completed_at' => $completed ? now() : null,
        ]);

        return new TaskChecklistResource($checklist->refresh()->load('completedBy'));
    }

    public function destroy(Task $task, TaskChecklist $checklist): Response
    {
        abort_unless($checklist->task_id === $task->id, 404);

        $this->authorize('deleteChecklist', $task);

        $checklist->delete();

        return response()->noContent();
    }
}
