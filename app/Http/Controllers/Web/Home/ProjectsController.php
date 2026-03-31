<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProjectsController extends Controller
{
    private readonly IProjectRepository $project_repository;

    public function __construct(IProjectRepository $project_repository)
    {
        $this->project_repository = $project_repository;
    }

    public function __invoke()
    {

        $projects = $this->project_repository->getAllPaginatedProjects() ?? [];

        return Inertia::render('home/projects/index', [
            'projects' => $projects,
        ]);
    }
}
