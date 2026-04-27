<?php

namespace App\Http\Controllers\Api\EnvVariables;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteEnvVariableController extends Controller
{
    public function __invoke(Request $request, string $id, string $variableId): JsonResponse
    {
        $project = Project::findOrFail($id);
        $variable = EnvironmentVariable::findOrFail($variableId);

        if (! in_array($request->user()->role, ['developer', 'admin'])) {
            return response()->json(['message' => 'Unauthorized. Only developers and admins can delete environment variables.'], 403);
        }

        $variable->delete();

        return response()->json(['message' => 'Variable deleted successfully']);
    }
}
