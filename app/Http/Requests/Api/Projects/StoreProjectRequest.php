<?php

namespace App\Http\Requests\Api\Projects;

use App\Rules\SafePath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'name')->where('user_id', auth()->id()),
            ],
            'framework_type' => 'required|string|in:laravel,react-vite,wordpress',
            'github_owner' => 'required|string|max:255',
            'github_repo' => 'required|string|regex:/^[\w.-]+$/',
            'github_branch' => 'required|string|max:255|regex:/^[\w.\-\/]+$/',
            'github_pat' => 'required|string|min:10',
            'deploy_path' => ['required', 'string', 'max:500', new SafePath],
            'webhook_secret' => 'required|string|min:16',
            'public_url' => 'nullable|url|max:255',
            'app_root_path' => 'nullable|string|max:500',
        ];
    }
}