<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectDetailController extends Controller
{
    public function __construct(
        private readonly IProjectRepository $project_repository
    ) {}

    public function __invoke(Request $request, string $id)
    {
        $project = $this->project_repository->getProjectById($id);

        return Inertia::render('home/projects/detail/index', [
            'project' => $project,
        ]);
    }
}
