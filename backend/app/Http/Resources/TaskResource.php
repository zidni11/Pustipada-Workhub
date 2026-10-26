<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'priority' => $this->priority,
            'division_id' => $this->division_id,
            'division' => $this->whenLoaded(
                'division',
                fn () => new DivisionResource($this->division),
            ),
            'creator' => $this->whenLoaded(
                'creator',
                fn () => new UserResource($this->creator),
            ),
            'pic' => $this->whenLoaded(
                'pic',
                fn () => new UserResource($this->pic),
            ),
            'members' => UserResource::collection($this->whenLoaded('members')),
            'due_date' => $this->due_date?->toDateString(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'activities' => TaskActivityResource::collection($this->whenLoaded('activities')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
