<?php

namespace App\Http\Controllers\Api\Projects;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RegenerateWebhookSecretController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository)
    {
        $project = $project_repository->findById($request->route('id'));

        if (! $project) {
            abort(404);
        }

        $project = $project_repository->regenerateWebhookSecret($project);

        return response()->json(['secret' => $project->webhook_secret]);
    }
}
