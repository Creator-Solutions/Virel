<?php

namespace App\Domain\Deployments\Contracts;

interface IDeploymentRepository
{
    public function countByStatusForUser(string $userId, string $status): int;

    public function countActiveForUser(string $userId): int;
}
