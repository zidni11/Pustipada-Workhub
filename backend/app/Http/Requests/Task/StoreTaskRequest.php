<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high'])],
            'division_id' => ['required', 'integer', Rule::exists('divisions', 'id')],
            'pic_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('is_active', true)],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', 'distinct', Rule::exists('users', 'id')->where('is_active', true)],
            'due_date' => ['nullable', 'date'],
        ];
    }
}
