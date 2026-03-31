<?php

namespace App\Domain\Projects\Contracts;

use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface IProjectRepository
{
    public function getAllPaginatedProjects(): LengthAwarePaginator;

    public function getAllProjectsByCount(): int;

    public function findById(string $id): ?Project;

    public function findByUserId(string $userId): Collection;

    public function findByUserIdWithLatestDeployment(string $userId, int $perPage = 5): LengthAwarePaginator;

    public function getProjectById(string $id): mixed;

    public function create(array $data, string $userId): Project;

    public function update(Project $project, array $data): Project;

    public function delete(Project $project): void;

    public function regenerateWebhookSecret(Project $project): Project;
}
