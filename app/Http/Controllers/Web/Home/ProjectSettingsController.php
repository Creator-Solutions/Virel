<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectSettingsController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository)
    {
        $project = $project_repository->findById($request->route('id'));

        if (! $project) {
            abort(404);
        }

        return Inertia::render('home/projects/settings/index', [
            'project' => $project,
        ]);
    }
}
