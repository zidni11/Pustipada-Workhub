<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high'])],
            'division_id' => ['sometimes', 'required', 'integer', Rule::exists('divisions', 'id')],
            'pic_id' => ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')->where('is_active', true)],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', 'distinct', Rule::exists('users', 'id')->where('is_active', true)],
            'due_date' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
