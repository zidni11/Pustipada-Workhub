<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarTaskResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'priority' => $this->priority,
            'due_date' => $this->due_date?->toDateString(),
            'division' => $this->whenLoaded(
                'division',
                fn () => new DivisionResource($this->division),
            ),
            'pic' => $this->whenLoaded(
                'pic',
                fn () => $this->pic ? new UserResource($this->pic) : null,
            ),
            'target_url' => "#/tasks/{$this->id}",
        ];
    }
}
