<?php

namespace App\Http\Controllers\Api\Projects;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Projects\StoreProjectRequest;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function __invoke(StoreProjectRequest $request, IProjectRepository $project_repository)
    {
        $validated = $request->validated();

        $user = Auth::user();
        $project = $project_repository->create($validated, $user->id);

        return response()->json($project, 201);
    }
}
