<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(TaskStatus::class)],
            'division_id' => ['sometimes', 'integer', Rule::exists('divisions', 'id')],
            'pic_id' => ['sometimes', 'integer', Rule::exists('users', 'id')],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'view_mode' => ['sometimes', Rule::in(['active', 'history', 'all'])],
            'assignment_role' => ['sometimes', Rule::in(['pic', 'supporting'])],
            'date_field' => ['sometimes', Rule::in(['activity', 'created_at'])],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:date_from'],
        ];
    }
}
