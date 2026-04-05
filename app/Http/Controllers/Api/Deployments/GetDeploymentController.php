<?php

namespace App\Http\Controllers\Api\Deployments;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Deployment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetDeploymentController extends Controller
{
    public function __invoke(Request $request, string $id, string $deploymentId): JsonResponse
    {
        $deployment = Deployment::with('project')
            ->where('project_id', $id)
            ->findOrFail($deploymentId);

        return response()->json(['data' => $deployment]);
    }
}
