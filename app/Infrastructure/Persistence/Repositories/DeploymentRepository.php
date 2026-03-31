<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Deployments\Contracts\IDeploymentRepository;
use App\Infrastructure\Persistence\Models\Deployment;

class DeploymentRepository implements IDeploymentRepository
{
    public function countByStatusForUser(string $userId, string $status): int
    {
        return Deployment::whereHas('project', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('status', $status)
            ->count();
    }

    public function countActiveForUser(string $userId): int
    {
        return Deployment::whereHas('project', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->whereIn('status', ['pending', 'running'])
            ->count();
    }
}
