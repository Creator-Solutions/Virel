<?php

namespace App\Infrastructure\Persistence\Repositories;

use Illuminate\Support\Facades\Hash;
use App\Domain\Projects\Contracts\IProjectRepository;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProjectRepository implements IProjectRepository
{
    public function findById(string $id): ?Project
    {
        return Project::find($id);
    }

    public function findByUserId(string $userId): Collection
    {
        return Project::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByUserIdWithLatestDeployment(string $userId, int $perPage = 5): LengthAwarePaginator
    {
        return Project::where('projects.user_id', $userId)
            ->with(['latestDeployment'])
            ->orderBy('projects.created_at', 'desc')
            ->paginate($perPage);
    }

    public function getAllPaginatedProjects(): LengthAwarePaginator
    {
        return Project::where('is_active', true)
            ->paginate(10);
    }

    public function getProjectById(string $id): mixed
    {
        return Project::with(['latestDeployment', 'recentDeployments', 'recentArtifacts'])
            ->findOrFail($id);
    }

    public function getAllProjectsByCount(): int
    {
        return Project::count();
    }

    public function create(array $data, string $userId): Project
    {
        return Project::create([
            'user_id' => $userId,
            'name' => $data['name'],
            'public_url' => $data['public_url'] ?? null,
            'deploy_path' => $data['deploy_path'],
            'github_owner' => $data['github_owner'],
            'github_repo' => $data['github_repo'],
            'github_branch' => $data['github_branch'] ?? 'main',
            'github_pat' => $data['github_pat'] ?? null,
            'webhook_secret' => Hash::make(Str::random(32)),
            'is_active' => true,
            'framework_type' => $data['framework_type'],
            'app_root_path' => $data['app_root_path'] ?? null,
        ]);
    }

    public function update(Project $project, array $data): Project
    {
        $project->update([
            'name' => $data['name'],
            'public_url' => $data['public_url'] ?? null,
            'deploy_path' => $data['deploy_path'],
            'github_owner' => $data['github_owner'],
            'github_repo' => $data['github_repo'],
            'github_branch' => $data['github_branch'] ?? 'main',
            'github_pat' => $data['github_pat'] ?? null,
            'framework_type' => $data['framework_type'] ?? $project->framework_type,
            'app_root_path' => $data['app_root_path'] ?? $project->app_root_path,
        ]);

        return $project->fresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    public function regenerateWebhookSecret(Project $project): Project
    {
        $project->update([
            'webhook_secret' => Str::random(32),
        ]);

        return $project->fresh();
    }
}
