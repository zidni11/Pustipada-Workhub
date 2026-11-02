<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TaskSubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'task_id' => $this->task_id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'title' => $this->title,
            'url' => $this->url,
            'file_url' => $this->file_path
                ? Storage::disk('public')->url($this->file_path)
                : null,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'user' => $this->whenLoaded(
                'user',
                fn () => new UserResource($this->user),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
