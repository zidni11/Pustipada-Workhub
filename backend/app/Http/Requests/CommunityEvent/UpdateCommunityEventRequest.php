<?php

namespace App\Http\Requests\CommunityEvent;

use App\Enums\CommunityEventCategory;
use App\Models\CommunityEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommunityEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $event = $this->route('event');

        if ($event instanceof CommunityEvent && ! $this->has('start_at')) {
            $this->merge([
                'start_at' => $event->start_at?->toDateTimeString(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'category' => ['sometimes', 'required', Rule::enum(CommunityEventCategory::class)],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_at' => ['sometimes', 'required', 'date'],
            'end_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_at'],
            'division_id' => ['sometimes', 'nullable', 'integer', Rule::exists('divisions', 'id')],
        ];
    }
}
