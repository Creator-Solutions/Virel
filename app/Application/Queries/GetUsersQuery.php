<?php

namespace App\Application\Queries;

use App\Domain\Interfaces\UserRepositoryInterface;
use App\Domain\Entities\User;

class GetUsersQuery
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function execute(): array
    {
        return $this->userRepository->findAll();
    }

    public function executeById(string $id): ?User
    {
        return $this->userRepository->findById($id);
    }
}
