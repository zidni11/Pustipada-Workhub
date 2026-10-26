<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Task\TransitionTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;

class TaskStatusController extends Controller
{
    public function __invoke(
        TransitionTaskRequest $request,
        Task $task,
        TaskService $tasks,
    ): TaskResource {
        $status = TaskStatus::from($request->validated('status'));

        $this->authorize('transitionTo', [$task, $status]);

        $task = $tasks->transition(
            $request->user(),
            $task,
            $status,
            $request->validated('note'),
        );

        return new TaskResource($task);
    }
}
