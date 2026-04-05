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

        if (! $project) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! $project->is_active) {
            return response()->json(['message' => 'Project is inactive.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'secret' => 'required|string',
            'artifact' => 'required|file|max:102400',
            'commit_sha' => 'nullable|string|size:40',
            'branch' => 'nullable|string|max:255',
            'trigger' => 'nullable|string|in:manual,workflow',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid request', 'details' => $validator->errors()], 422);
        }

        if (! $this->verifySecret($project, $request->input('secret'))) {
            Log::warning("Invalid webhook secret for project {$project->id}");

            return response()->json(['error' => 'Invalid secret'], 401);
        }

        $artifactFile = $request->file('artifact');

        if ($artifactFile->getClientOriginalExtension() !== 'zip') {
            return response()->json(['message' => 'Invalid artifact format. Only zip files are accepted.'], 422);
        }

        $allowedMimes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
        if (! in_array($artifactFile->getMimeType(), $allowedMimes, true)) {
            return response()->json(['message' => 'Invalid artifact MIME type.'], 422);
        }

        $commitSha = $request->input('commit_sha');
        $branch = $request->input('branch');
        $trigger = $request->input('trigger') === 'workflow'
            ? Deployment::TRIGGER_WORKFLOW
            : Deployment::TRIGGER_WEBHOOK;

        $deployment = $this->deploymentService->receiveArtifacts(
            $project,
            $artifactFile ? [$artifactFile] : [],
            $commitSha,
            $branch,
            $trigger
        );

        return response()->json([
            'message' => 'Deployment started',
            'deployment_id' => $deployment->id,
        ], 202);
    }

    private function verifySecret(Project $project, string $secret): bool
    {
        return hash_equals($project->webhook_secret, $secret);
    }
}
