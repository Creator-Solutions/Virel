<?php

namespace App\Http\Controllers\Api\Projects;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnvironmentVariableController extends Controller
{
    public function index(string $projectId): JsonResponse
    {
        $project = \App\Infrastructure\Persistence\Models\Project::findOrFail($projectId);
        
        $variables = $project->environmentVariables()
            ->orderBy('key')
            ->get()
            ->map(fn($v) => ['id' => $v->id, 'key' => $v->key, 'value' => $v->value]);

        return response()->json(['data' => $variables]);
    }

    public function store(Request $request, string $projectId): JsonResponse
    {
        $project = \App\Infrastructure\Persistence\Models\Project::findOrFail($projectId);

        $validator = Validator::make($request->all(), [
            'key' => ['required', 'string', 'max:255', 'regex:/^[A-Z_][A-Z0-9_]*$/i'],
            'value' => ['required', 'string', 'max:10000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $variable = EnvironmentVariable::updateOrCreate(
            ['project_id' => $project->id, 'key' => $request->input('key')],
            ['value' => $request->input('value')]
        );

        return response()->json([
            'data' => ['id' => $variable->id, 'key' => $variable->key, 'value' => $variable->value],
        ], 201);
    }

    public function update(Request $request, string $projectId, string $variableId): JsonResponse
    {
        $variable = EnvironmentVariable::where('id', $variableId)
            ->where('project_id', $projectId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'value' => ['required', 'string', 'max:10000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $variable->update(['value' => $request->input('value')]);

        return response()->json([
            'data' => ['id' => $variable->id, 'key' => $variable->key, 'value' => $variable->value],
        ]);
    }

    public function destroy(string $projectId, string $variableId): JsonResponse
    {
        $variable = EnvironmentVariable::where('id', $variableId)
            ->where('project_id', $projectId)
            ->firstOrFail();

        $variable->delete();

        return response()->json(null, 204);
    }
}