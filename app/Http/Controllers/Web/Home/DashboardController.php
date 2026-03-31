<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Deployments\Contracts\IDeploymentRepository;
use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(
        IProjectRepository $project_repository,
        IDeploymentRepository $deployment_repository
    ) {
        $user = Auth::user();

        $projects = $project_repository->findByUserIdWithLatestDeployment($user->id);

        $stats = [
            'total_projects' => $project_repository->getAllProjectsByCount(),
            'active_deployments' => $deployment_repository->countActiveForUser($user->id),
            'successful' => $deployment_repository->countByStatusForUser($user->id, 'success'),
            'failed' => $deployment_repository->countByStatusForUser($user->id, 'failed'),
        ];

        $projectsData = $projects->through(function ($project) {
            $latestDeployment = $project->latestDeployment;

            return [
                'id' => $project->id,
                'name' => $project->name,
                'github_owner' => $project->github_owner,
                'github_repo' => $project->github_repo,
                'github_branch' => $project->github_branch,
                'public_url' => $project->public_url,
                'is_active' => $project->is_active,
                'created_at' => $project->created_at?->toISOString(),
                'latest_deployment' => $latestDeployment ? [
                    'id' => $latestDeployment->id,
                    'status' => $latestDeployment->status,
                    'commit_sha' => $latestDeployment->commit_sha,
                    'created_at' => $latestDeployment->created_at?->toISOString(),
                    'completed_at' => $latestDeployment->completed_at?->toISOString(),
                ] : null,
            ];
        });

        return Inertia::render('home/dashboard/index', [
            'stats' => $stats,
            'projects' => $projectsData,
        ]);
    }
}
