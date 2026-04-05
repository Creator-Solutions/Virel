<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Events\ProjectCreated;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoreProjectController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'public_url' => ['nullable', 'url', 'max:255'],
            'deploy_path' => ['required', 'string', 'max:500', 'regex:/^\/[a-zA-Z0-9_\-\/\.]+$/'],
            'github_owner' => ['required', 'string', 'max:255'],
            'github_repo' => ['required', 'string', 'max:255'],
            'github_branch' => ['required', 'string', 'max:255'],
            'github_pat' => ['nullable', 'string', 'max:500'],
            'framework_type' => ['required', 'string', 'in:laravel,react-vite,wordpress'],
            'app_root_path' => ['nullable', 'string', 'max:500', 'regex:/^\/[a-zA-Z0-9_\-\/\.]+$/', 'required_if:framework_type,laravel'],
        ]);

        $user = Auth::user();
        $project = $project_repository->create($validated, $user->id);

        event(new ProjectCreated($project));

        return to_route('home.projects.index');
    }
}
