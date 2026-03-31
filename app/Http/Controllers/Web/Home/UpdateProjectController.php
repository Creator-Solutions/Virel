<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UpdateProjectController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository)
    {
        $project = $project_repository->findById($request->route('id'));

        if (! $project) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'public_url' => ['nullable', 'url', 'max:255'],
            'deploy_path' => ['required', 'string', 'max:500'],
            'github_owner' => ['required', 'string', 'max:255'],
            'github_repo' => ['required', 'string', 'max:255'],
            'github_branch' => ['required', 'string', 'max:255'],
            'github_pat' => ['nullable', 'string', 'max:500'],
        ]);

        $project_repository->update($project, $validated);

        return back()->with('success', 'Project updated successfully.');
    }
}
