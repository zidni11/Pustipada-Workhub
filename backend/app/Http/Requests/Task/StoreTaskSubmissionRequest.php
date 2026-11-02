<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskSubmissionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskSubmissionRequest extends FormRequest
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
            'type' => ['required', Rule::enum(TaskSubmissionType::class)],
            'title' => ['required', 'string', 'max:255'],
            'url' => [
                'nullable',
                'required_if:type,link',
                'url:http,https',
                'max:2048',
            ],
            'file' => [
                'nullable',
                'required_if:type,file',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,png,jpg,jpeg,webp,zip',
            ],
        ];
    }
}
