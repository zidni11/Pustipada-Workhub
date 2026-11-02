<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskSubmissionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskSubmissionRequest;
use App\Http\Resources\TaskSubmissionResource;
use App\Models\Task;
use App\Models\TaskSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TaskSubmissionController extends Controller
{
    public function store(StoreTaskSubmissionRequest $request, Task $task): JsonResponse
    {
        $this->authorize('submitProof', $task);

        $data = $request->validated();
        $type = TaskSubmissionType::from($data['type']);
        $file = $request->file('file');
        $filePath = $file?->store("task-submissions/{$task->id}", 'public');

        $submission = DB::transaction(fn () => TaskSubmission::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'type' => $type,
            'title' => $data['title'],
            'url' => $type === TaskSubmissionType::LINK ? $data['url'] : null,
            'file_path' => $type === TaskSubmissionType::FILE ? $filePath : null,
            'original_name' => $type === TaskSubmissionType::FILE
                ? $file?->getClientOriginalName()
                : null,
            'mime_type' => $type === TaskSubmissionType::FILE
                ? $file?->getClientMimeType()
                : null,
            'file_size' => $type === TaskSubmissionType::FILE
                ? $file?->getSize()
                : null,
        ]));

        return (new TaskSubmissionResource($submission->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Task $task, TaskSubmission $submission): Response
    {
        abort_unless($submission->task_id === $task->id, 404);

        $this->authorize('delete', $submission);

        if ($submission->file_path) {
            Storage::disk('public')->delete($submission->file_path);
        }

        $submission->delete();

        return response()->noContent();
    }
}
