<?php

namespace App\Application\Commands;

use App\Application\DTOs\CreateUserDTO;
use App\Domain\Interfaces\UserRepositoryInterface;
use App\Domain\ValueObjects\Email;
use App\Domain\Entities\User;
use DateTimeImmutable;

class CreateUserCommand
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function execute(CreateUserDTO $dto): User
    {
        $existingUser = $this->userRepository->findByEmail($dto->email);
        
        if ($existingUser !== null) {
            throw new \InvalidArgumentException('User with this email already exists');
        }

        $email = new Email($dto->email);
        
        $user = new User(
            id: $this->generateUuid(),
            name: $dto->name,
            email: $email,
            createdAt: new DateTimeImmutable()
        );

        return $this->userRepository->save($user);
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0x0fff) | 0x4000,
            random_int(0, 0x3fff) | 0x8000,
            random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0xffff)
        );
    }
}
