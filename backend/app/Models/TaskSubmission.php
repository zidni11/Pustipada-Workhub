<?php

namespace App\Models;

use App\Enums\TaskSubmissionType;
use Database\Factories\TaskSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'task_id',
    'user_id',
    'type',
    'title',
    'url',
    'file_path',
    'original_name',
    'mime_type',
    'file_size',
])]
class TaskSubmission extends Model
{
    /** @use HasFactory<TaskSubmissionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => TaskSubmissionType::class,
            'file_size' => 'integer',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
