<?php

namespace App\Application\Services;

use App\Application\Commands\CreateUserCommand;
use App\Application\DTOs\CreateUserDTO;
use App\Application\Queries\GetUsersQuery;
use App\Domain\Entities\User;

class UserService
{
    public function __construct(
        private readonly CreateUserCommand $createUserCommand,
        private readonly GetUsersQuery $getUsersQuery
    ) {}

    public function createUser(array $data): User
    {
        $dto = CreateUserDTO::fromArray($data);
        return $this->createUserCommand->execute($dto);
    }

    public function getUsers(): array
    {
        return $this->getUsersQuery->execute();
    }

    public function getUserById(string $id): ?User
    {
        return $this->getUsersQuery->executeById($id);
    }
}
