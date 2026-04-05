<?php

namespace App\Http\Controllers\Api\Projects;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Events\ProjectPatUpdated;
use App\Http\Controllers\Controller;
use App\Services\GithubActionsService;
use Illuminate\Http\Request;

class UpdateProjectController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository, GithubActionsService $githubActionsService)
    {
        $project = $project_repository->findById($request->route('id'));

        if (! $project) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'public_url' => ['nullable', 'url', 'max:255'],
            'deploy_path' => ['required', 'string', 'max:500', 'regex:/^\/[a-zA-Z0-9_\-\/\.]+$/'],
            'github_owner' => ['required', 'string', 'max:255'],
            'github_repo' => ['required', 'string', 'max:255'],
            'github_branch' => ['required', 'string', 'max:255'],
            'github_pat' => ['nullable', 'string', 'max:500'],
            'framework_type' => ['nullable', 'string', 'in:laravel,react-vite,wordpress'],
            'app_root_path' => ['nullable', 'string', 'max:500', 'regex:/^\/[a-zA-Z0-9_\-\/\.]+$/'],
        ]);

        $oldPat = $project->github_pat;
        $oldFrameworkType = $project->framework_type;
        $project = $project_repository->update($project, $validated);

        if (isset($validated['github_pat']) && $validated['github_pat'] !== $oldPat) {
            event(new ProjectPatUpdated($project));
        }

        if (
            isset($validated['framework_type'])
            && $validated['framework_type'] !== $oldFrameworkType
            && $project->hasGithubSetup()
        ) {
            $githubActionsService->createWorkflow($project);
        }

        return response()->json($project);
    }
}
