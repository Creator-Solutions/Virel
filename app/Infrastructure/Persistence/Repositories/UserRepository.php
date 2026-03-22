<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Auth\Contracts\IUserRepository;

use App\Infrastructure\Persistence\Models\User;

class UserRepository implements IUserRepository{

   public function findByEmail(string $email): ?User
   {
      $model = User::where('email', '=', $email)->first();
      if (!$model){
         return null;
      }

      return $model;
   }

   public function findById(string $id): ?User
   {
      $model = User::FindOrFail($id);
      return $model;
   }

   public function findByGithubId(string $id): ?User
   {
      $model = User::where('github_id', '=', $id)->first();
      return $model;
   }
}