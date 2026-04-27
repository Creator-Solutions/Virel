<?php

namespace App\Http\Controllers\Api\EnvVariables;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateEnvVariableController extends Controller
{
    public function __invoke(Request $request, string $id, string $variableId): JsonResponse
    {
        $project = Project::findOrFail($id);
        $variable = EnvironmentVariable::findOrFail($variableId);

        if (! in_array($request->user()->role, ['developer', 'admin'])) {
            return response()->json(['message' => 'Unauthorized. Only developers and admins can update environment variables.'], 403);
        }

        $validated = $request->validate([
            'value' => ['required', 'string'],
        ]);

        $variable->update([
            'value' => $validated['value'],
        ]);

        $variable->refresh();

        return response()->json([
            'id' => $variable->id,
            'key' => $variable->key,
            'value' => $variable->getMaskedValue(),
            'environment' => $variable->environment,
            'updated_at' => $variable->updated_at?->toIso8601String(),
        ]);
    }
}
