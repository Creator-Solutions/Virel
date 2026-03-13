<?php

namespace App\Application\UseCases;

use App\Application\Commands\CreateUserCommand;
use App\Application\DTOs\CreateUserDTO;
use App\Domain\Entities\User;

class CreateUserUseCase
{
    public function __construct(
        private readonly CreateUserCommand $createUserCommand
    ) {}

    public function execute(array $data): User
    {
        $dto = CreateUserDTO::fromArray($data);
        
        if (empty($dto->name)) {
            throw new \InvalidArgumentException('Name is required');
        }
        
        if (empty($dto->email)) {
            throw new \InvalidArgumentException('Email is required');
        }

        return $this->createUserCommand->execute($dto);
    }
}
