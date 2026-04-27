<?php

namespace App\Http\Controllers\Api\Projects;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class UploadSqlController extends Controller
{
    public function __invoke(Request $request, string $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);

        $request->validate([
            'sql_file' => 'required|file|mimes:sql|max:51200',
        ]);

        $file = $request->file('sql_file');
        $path = storage_path("app/sql-dumps/{$projectId}");

        File::ensureDirectoryExists($path);
        $file->move($path, 'database.sql');

        return response()->json(['message' => 'SQL file uploaded successfully']);
    }

    public function show(Request $request, string $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $sqlFile = storage_path("app/sql-dumps/{$projectId}/database.sql");

        if (!File::exists($sqlFile)) {
            return response()->json(['uploaded' => false]);
        }

        return response()->json([
            'uploaded' => true,
            'filename' => 'database.sql',
            'size' => File::size($sqlFile),
        ]);
    }
}