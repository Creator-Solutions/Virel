<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeleteProjectController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository)
    {
        $project = $project_repository->findById($request->route('id'));

        if (! $project) {
            abort(404);
        }

        $project_repository->delete($project);

        return to_route('home.projects.index')->with('success', 'Project deleted successfully.');
    }
}
