<?php

namespace App\Http\Controllers\Api\Projects;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Deployment;
use App\Infrastructure\Persistence\Models\Project;
use App\Services\DeploymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ReceiveArtifactController extends Controller
{
    public function __construct(private DeploymentService $deploymentService) {}

    public function __invoke(Request $request, string $projectId): JsonResponse
    {
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (!$project->is_active) {
            return response()->json(['message' => 'Project is inactive.'], 403);
        }

        // Authenticate via Bearer token instead of request body field
        $token = $request->bearerToken();
        if (!$token || !hash_equals($project->webhook_secret, $token)) {
            Log::warning("Invalid or missing Bearer token for project {$project->id}");
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'artifact'       => 'required|file|max:102400',
            'commit_sha'     => 'nullable|string|max:40',
            'commit_message' => 'nullable|string|max:500',
            'triggered_by'   => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid request', 'details' => $validator->errors()], 422);
        }

        $artifactFile = $request->file('artifact');

        if ($artifactFile->getClientOriginalExtension() !== 'zip') {
            return response()->json(['message' => 'Invalid artifact format. Only zip files are accepted.'], 422);
        }

        $allowedMimes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
        if (!in_array($artifactFile->getMimeType(), $allowedMimes, true)) {
            return response()->json(['message' => 'Invalid artifact MIME type.'], 422);
        }

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
}