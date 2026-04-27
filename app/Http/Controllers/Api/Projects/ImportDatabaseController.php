<?php

namespace App\Http\Controllers\Api\Projects;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Project;
use App\Services\DatabaseImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ImportDatabaseController extends Controller
{
    public function __construct(
        private readonly DatabaseImportService $databaseImportService
    ) {}

    public function __invoke(Request $request, string $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);

        $sqlFile = storage_path("app/sql-dumps/{$projectId}/database.sql");

        if (!File::exists($sqlFile)) {
            return response()->json(['error' => 'No SQL file uploaded. Please upload a SQL file first.'], 400);
        }

        try {
            $this->databaseImportService->import($project, $sqlFile);

            return response()->json(['message' => 'Database imported successfully']);
        }
        catch (\Exception $e) {
            report($e);

            return response()->json(['error' => 'Database import failed. Please check the logs for details.'], 500);
        }
    }
}