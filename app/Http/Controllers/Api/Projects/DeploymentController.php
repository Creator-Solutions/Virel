<?php

namespace App\Http\Controllers\Api\Projects;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Artifact;
use App\Infrastructure\Persistence\Models\Deployment;
use App\Infrastructure\Persistence\Models\Project;
use App\Services\DeploymentService;
use Illuminate\Http\Request;

class DeploymentController extends Controller
{
    public function index(Request $request, string $projectId)
    {
        $project = Project::findOrFail($projectId);

        $perPage = $request->input('per_page', 15);

        $deployments = $project->deployments()
            ->with('triggeredByUser')
            ->when($request->status, function ($query) use ($request) {
                return $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $deployments->items(),
            'current_page' => $deployments->currentPage(),
            'last_page' => $deployments->lastPage(),
            'per_page' => $deployments->perPage(),
            'total' => $deployments->total(),
        ]);
    }

    public function rollback(Request $request, string $projectId, string $artifactId, DeploymentService $deploymentService)
    {
        $artifact = Artifact::where('project_id', $projectId)
            ->where('id', $artifactId)
            ->firstOrFail();

        $project = Project::findOrFail($projectId);

        $deployment = Deployment::create([
            'project_id' => $projectId,
            'status' => Deployment::STATUS_RUNNING,
            'trigger' => Deployment::TRIGGER_ROLLBACK,
            'triggered_by' => $request->user()->id,
            'started_at' => now(),
        ]);

        $artifact->update(['deployment_id' => $deployment->id]);

        $deploymentService->processDeployment($deployment);

        return response()->json([
            'deployment' => [
                'id' => $deployment->id,
                'project_id' => $deployment->project_id,
                'status' => $deployment->status,
            ],
        ]);
    }
}
