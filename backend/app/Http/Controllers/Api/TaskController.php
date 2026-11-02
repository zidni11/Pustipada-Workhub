<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\TaskIndexRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $tasks) {}

    public function index(TaskIndexRequest $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Task::class);

        $query = Task::query()->with([
            'division',
            'creator',
            'pic',
            'members',
            'submissions.user',
            'checklists',
        ]);

        $user = $request->user();

        $query->visibleTo($user);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->input('view_mode') === 'history') {
            $query->history();
        } elseif ($request->input('view_mode') === 'active') {
            $query->active();
        }

        if ($request->filled('division_id')) {
            $query->where('division_id', $request->integer('division_id'));
        }

        if ($request->filled('pic_id')) {
            $query->where('pic_id', $request->integer('pic_id'));
        }

        if ($request->filled('assignment_role')) {
            if ($request->input('assignment_role') === 'pic') {
                $query->where('pic_id', $user->id);
            } else {
                $query->where(function ($query) use ($user) {
                    $query->whereNull('pic_id')
                        ->orWhere('pic_id', '!=', $user->id);
                })->whereHas(
                    'members',
                    fn ($members) => $members->where('users.id', $user->id),
                );
            }
        }

        if ($request->filled('date_from') || $request->filled('date_to')) {
            $from = $request->filled('date_from')
                ? Carbon::parse($request->input('date_from'))->startOfDay()
                : null;
            $to = $request->filled('date_to')
                ? Carbon::parse($request->input('date_to'))->endOfDay()
                : null;

            if ($request->input('date_field') === 'created_at') {
                if ($from !== null) {
                    $query->where('created_at', '>=', $from);
                }

                if ($to !== null) {
                    $query->where('created_at', '<=', $to);
                }
            } else {
                $query->where(function ($query) use ($from, $to) {
                    $query->where(function ($query) use ($from, $to) {
                        $query->whereNotNull('completed_at');

                        if ($from !== null) {
                            $query->where('completed_at', '>=', $from);
                        }

                        if ($to !== null) {
                            $query->where('completed_at', '<=', $to);
                        }
                    })->orWhere(function ($query) use ($from, $to) {
                        $query->whereNull('completed_at');

                        if ($from !== null) {
                            $query->where('updated_at', '>=', $from);
                        }

                        if ($to !== null) {
                            $query->where('updated_at', '<=', $to);
                        }
                    });
                });
            }
        }

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';

            $query->where(function ($query) use ($term) {
                $query->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        return TaskResource::collection(
            $query->latest()->paginate($request->integer('per_page', 15)),
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
            $this->tasks->update($request->user(), $task, $request->validated()),
        );
    }

    public function destroy(Task $task): Response
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->noContent();
    }
}
