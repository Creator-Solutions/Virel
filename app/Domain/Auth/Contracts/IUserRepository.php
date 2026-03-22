<?php

namespace App\Domain\Auth\Contracts;

use App\Infrastructure\Persistence\Models\User;

interface IUserRepository {

   function findById(string $id): ?User;
   function findByGithubId(string $id): ?User;
   function findByEmail(string $email): ?User;
}