<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $tasks) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Task::class);

        $query = Task::query()->with(['division', 'creator', 'pic', 'members']);

        $user = $request->user();

        if ($user->role === UserRole::ANGGOTA) {
            $query->where(function ($query) use ($user) {
                $query->where('division_id', $user->division_id)
                    ->orWhere('pic_id', $user->id)
                    ->orWhereHas('members', fn ($members) => $members->where('users.id', $user->id));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('division_id')) {
            $query->where('division_id', $request->integer('division_id'));
        }

        if ($request->filled('pic_id')) {
            $query->where('pic_id', $request->integer('pic_id'));
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->input('search').'%');
        }

        return TaskResource::collection(
            $query->latest()->paginate(15),
        );
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $this->authorize('create', Task::class);

        $task = $this->tasks->create($request->user(), $request->validated());

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Task $task): TaskResource
    {
        $this->authorize('view', $task);

        return new TaskResource($this->tasks->loadForDetail($task));
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $this->authorize('update', $task);

        return new TaskResource(
            $this->tasks->update($task, $request->validated()),
        );
    }

    public function destroy(Task $task): Response
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->noContent();
    }
}
