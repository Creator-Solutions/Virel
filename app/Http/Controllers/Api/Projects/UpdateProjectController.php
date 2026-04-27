<?php

namespace App\Http\Controllers\Api\Projects;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Events\ProjectPatUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Projects\UpdateProjectRequest;
use App\Services\GithubActionsService;

class UpdateProjectController extends Controller
{
    public function __invoke(UpdateProjectRequest $request, IProjectRepository $project_repository, GithubActionsService $githubActionsService)
    {
        $project = $project_repository->findById($request->route('id'));

        if (! $project) {
            abort(404);
        }

        $validated = $request->validated();

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
