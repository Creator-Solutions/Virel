<?php

namespace App\Http\Controllers\Api\Deployments;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Deployment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetDeploymentLogController extends Controller
{
    public function __invoke(Request $request, string $id, string $deploymentId): JsonResponse
    {
        $deployment = Deployment::where('project_id', $id)
            ->findOrFail($deploymentId);

        if (! $deployment->log) {
            return response()->json(['log' => 'No log available for this deployment.']);
        }

        return response()->json(['log' => $deployment->log]);
    }
}
