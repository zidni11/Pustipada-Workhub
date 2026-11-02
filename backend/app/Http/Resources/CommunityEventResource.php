<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityEventResource extends JsonResource
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
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'location' => $this->location,
            'start_at' => $this->start_at?->toIso8601String(),
            'end_at' => $this->end_at?->toIso8601String(),
            'division_id' => $this->division_id,
            'division' => $this->whenLoaded(
                'division',
                fn () => $this->division
                    ? new DivisionResource($this->division)
                    : null,
            ),
            'creator' => $this->whenLoaded(
                'creator',
                fn () => $this->creator
                    ? new UserResource($this->creator)
                    : null,
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
