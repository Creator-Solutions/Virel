<?php

namespace App\Http\Controllers\Api\EnvVariables;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreEnvVariableController extends Controller
{
    public function __invoke(Request $request, string $id): JsonResponse
    {
        $project = Project::findOrFail($id);

        if (! in_array($request->user()->role, ['developer', 'admin'])) {
            return response()->json(['message' => 'Unauthorized. Only developers and admins can add environment variables.'], 403);
        }

        $validated = $request->validate([
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
            'environment' => ['required', 'string', 'in:'.implode(',', EnvironmentVariable::ENVIRONMENTS)],
        ]);

        $exists = EnvironmentVariable::where('project_id', $project->id)
            ->where('key', $validated['key'])
            ->where('environment', $validated['environment'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Variable with this key already exists for '.$validated['environment'].' environment',
            ], 422);
        }

        $variable = EnvironmentVariable::create([
            'project_id' => $project->id,
            'key' => $validated['key'],
            'value' => $validated['value'],
            'environment' => $validated['environment'],
        ]);

        return response()->json([
            'id' => $variable->id,
            'key' => $variable->key,
            'value' => $variable->getMaskedValue(),
            'environment' => $variable->environment,
            'created_at' => $variable->created_at->toIso8601String(),
            'updated_at' => $variable->updated_at->toIso8601String(),
        ], 201);
    }
}
