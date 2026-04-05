<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeploymentHistoryController extends Controller
{
    public function __invoke(Request $request, string $projectId)
    {
        $project = Project::findOrFail($projectId);

        $deployments = $project->deployments()
            ->with('triggeredByUser')
            ->when($request->status, function ($query) use ($request) {
                return $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('home/projects/deployments/index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'github_owner' => $project->github_owner,
                'github_repo' => $project->github_repo,
            ],
            'deployments' => [
                'data' => $deployments->items(),
                'current_page' => $deployments->currentPage(),
                'last_page' => $deployments->lastPage(),
                'per_page' => $deployments->perPage(),
                'total' => $deployments->total(),
            ],
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }
}
