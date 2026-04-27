<?php

namespace App\Http\Requests\Api\Projects;

use App\Rules\SafePath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('projects', 'name')
                    ->where('user_id', auth()->id())
                    ->ignore($this->route('id')),
            ],
            'framework_type' => 'sometimes|string|in:laravel,react-vite,wordpress',
            'github_owner' => 'sometimes|string|max:255',
            'github_repo' => 'sometimes|string|regex:/^[\w.-]+$/',
            'github_branch' => 'sometimes|string|max:255|regex:/^[\w.\-\/]+$/',
            'github_pat' => 'sometimes|string|min:10',
            'deploy_path' => ['sometimes', 'string', 'max:500', new SafePath],
            'webhook_secret' => 'sometimes|string|min:16',
            'public_url' => 'sometimes|url|max:255',
            'app_root_path' => 'nullable|string|max:500',
        ];
    }
}