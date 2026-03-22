<?php

namespace App\Application\Auth\CreateSession;

use App\Domain\Auth\Contracts\IUserRepository;
use DomainException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use LogicException;

class CreateSessionCommandHandler
{
    private readonly IUserRepository $user_repository;

    public function __construct(IUserRepository $user_repository)
    {
        $this->user_repository = $user_repository;
    }

    public function handle(CreateSessionCommand $command): array
    {
        if (Auth::check()) {
            throw new LogicException('Already authenticated.');
        }

        $user = $this->user_repository->findByEmail($command->email);

        if (! $user || ! Hash::check($command->password, $user->password)) {
            throw new DomainException('Invalid credentials.');
        }

        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ],
        ];
    }
}
