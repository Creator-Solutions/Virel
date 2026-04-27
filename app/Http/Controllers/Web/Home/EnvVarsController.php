<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnvVarsController extends Controller
{
    public function __construct(
        private readonly IProjectRepository $project_repository
    ) {}

    public function __invoke(Request $request, string $id)
    {
        $project = $this->project_repository->getProjectById($id);

        if (!$project) {
            abort(404);
        }

        return Inertia::render('home/projects/env/index', [
            'project' => $project,
        ]);
    }
}
