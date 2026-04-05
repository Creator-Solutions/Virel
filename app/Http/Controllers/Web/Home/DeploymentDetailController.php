<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Artifact;
use App\Infrastructure\Persistence\Models\Deployment;
use App\Infrastructure\Persistence\Models\Project;
use Inertia\Inertia;

class DeploymentDetailController extends Controller
{
    public function __invoke(string $projectId, string $deploymentId)
    {
        $project = Project::findOrFail($projectId);
        $deployment = Deployment::with('triggeredByUser')->findOrFail($deploymentId);

        $artifacts = Artifact::where('project_id', $projectId)
            ->where('deployment_id', $deploymentId)
            ->orderBy('created_at', 'desc')
            ->get();

        $logLines = $deployment->log ? explode("\n", $deployment->log) : [];

        return Inertia::render('home/projects/deployments/detail/index', [
            'projectId' => $projectId,
            'deploymentId' => $deploymentId,
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'deployment' => [
                'id' => $deployment->id,
                'project_id' => $deployment->project_id,
                'status' => $deployment->status,
                'trigger' => $deployment->trigger,
                'commit_sha' => $deployment->commit_sha,
                'branch' => $deployment->branch,
                'triggered_by' => $deployment->triggeredByUser ? [
                    'id' => $deployment->triggeredByUser->id,
                    'name' => $deployment->triggeredByUser->name,
                ] : null,
                'started_at' => $deployment->started_at?->toIsoString(),
                'completed_at' => $deployment->completed_at?->toIsoString(),
                'created_at' => $deployment->created_at->toIsoString(),
            ],
            'artifacts' => $artifacts->map(fn ($artifact) => [
                'id' => $artifact->id,
                'file_path' => $artifact->file_path,
                'file_size' => $artifact->file_size,
                'created_at' => $artifact->created_at->toIsoString(),
            ]),
            'logLines' => $logLines,
        ]);
    }
}
