<?php

namespace App\Http\Controllers\Api\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Projects\ReceiveArtifactRequest;
use App\Infrastructure\Persistence\Models\Project;
use App\Services\DeploymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ReceiveArtifactController extends Controller
{
    public function __construct(private DeploymentService $deploymentService) {}

    public function __invoke(ReceiveArtifactRequest $request, string $projectId): JsonResponse
    {
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (!$project->is_active) {
            return response()->json(['message' => 'Project is inactive.'], 403);
        }

        $token = $request->bearerToken();
        if (!$token || !hash_equals($project->webhook_secret, $token)) {
            Log::warning("Invalid or missing Bearer token for project {$project->id}");
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $validated = $request->validated();
        $artifactFile = $validated['artifact'] ?? null;

        if ($artifactFile->getClientOriginalExtension() !== 'zip') {
            return response()->json(['message' => 'Invalid artifact format. Only zip files are accepted.'], 422);
        }

        $allowedMimes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
        if (!in_array($artifactFile->getMimeType(), $allowedMimes, true)) {
            return response()->json(['message' => 'Invalid artifact MIME type.'], 422);
        }

        try {
            $deployment = $this->deploymentService->receiveArtifacts(
                $project,
                $artifactFile ? [$artifactFile] : [],
                $request->input('commit_sha'),
                $request->input('commit_message'),
                $request->input('triggered_by'),
            );

            return response()->json([
                'message'       => 'Deployment started',
                'deployment_id' => $deployment->id,
            ], 202);
        }
        catch (\Exception $e) {
            report($e);

            return response()->json([
                'error' => 'Deployment failed. Please check the deployment logs for details.',
            ], 500);
        }
    }
}