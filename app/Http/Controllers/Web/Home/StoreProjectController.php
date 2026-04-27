<?php

namespace App\Http\Controllers\Web\Home;

use App\Domain\Projects\Contracts\IProjectRepository;
use App\Events\ProjectCreated;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoreProjectController extends Controller
{
    public function __invoke(Request $request, IProjectRepository $project_repository)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'public_url' => ['nullable', 'url', 'max:255'],
            'deploy_path' => ['required', 'string', 'max:500'],
            'github_owner' => ['required', 'string', 'max:255'],
            'github_repo' => ['required', 'string', 'max:255'],
            'github_branch' => ['required', 'string', 'max:255'],
            'github_pat' => ['nullable', 'string', 'max:500'],
            'framework_type' => ['required', 'string', 'in:laravel,react-vite,wordpress'],
            'app_root_path' => ['nullable', 'string', 'max:500'],
            'db_name' => ['nullable', 'string', 'max:255'],
            'db_user' => ['nullable', 'string', 'max:255'],
            'db_password' => ['nullable', 'string', 'max:500'],
            'db_host' => ['nullable', 'string', 'max:255'],
            'db_prefix' => ['nullable', 'string', 'max:255'],
        ]);

        $user = Auth::user();
        $project = $project_repository->create($validated, $user->id);

        if ($validated['framework_type'] === 'wordpress') {
            $this->saveDatabaseCredentials($project->id, $validated);
        }

        event(new ProjectCreated($project));

        return to_route('home.projects.index');
    }

    private function saveDatabaseCredentials(string $projectId, array $data): void
    {
        $dbVars = [
            'DB_NAME' => $data['db_name'] ?? null,
            'DB_USER' => $data['db_user'] ?? null,
            'DB_PASSWORD' => $data['db_password'] ?? null,
            'DB_HOST' => $data['db_host'] ?? 'localhost',
            'DB_PREFIX' => $data['db_prefix'] ?? 'wp_',
        ];

        foreach ($dbVars as $key => $value) {
            if (!empty($value)) {
                EnvironmentVariable::updateOrCreate(
                    ['project_id' => $projectId, 'key' => $key],
                    ['value' => $value]
                );
            }
        }
    }
}
