<?php

namespace App\Http\Controllers\Api\EnvVariables;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Http\JsonResponse;

class RevealEnvVariableController extends Controller
{
    public function __invoke(string $id, string $variableId): JsonResponse
    {
        $project = Project::findOrFail($id);
        $variable = EnvironmentVariable::findOrFail($variableId);

        if ($variable->project_id !== $project->id) {
            return response()->json(['message' => 'Variable not found'], 404);
        }

        $revealedValue = $variable->getRevealedValue();

        if ($revealedValue === EnvironmentVariable::DECRYPTION_ERROR) {
            return response()->json([
                'message' => 'Unable to reveal value. The encryption key may have changed. Please update this variable with a new value.',
                'decryption_error' => true,
            ], 422);
        }

        return response()->json([
            'id' => $variable->id,
            'key' => $variable->key,
            'value' => $revealedValue,
            'environment' => $variable->environment,
        ]);
    }
}
