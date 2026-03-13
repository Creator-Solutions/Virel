<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\User;
use App\Domain\Interfaces\UserRepositoryInterface;
use App\Domain\ValueObjects\Email;
use App\Models\User as UserModel;
use DateTimeImmutable;

class UserRepository implements UserRepositoryInterface
{
    public function findById(string $id): ?User
    {
        $model = UserModel::find($id);
        
        if ($model === null) {
            return null;
        }

        return $this->mapToEntity($model);
    }

    public function findByEmail(string $email): ?User
    {
        $model = UserModel::where('email', $email)->first();
        
        if ($model === null) {
            return null;
        }

        return $this->mapToEntity($model);
    }

    public function findAll(): array
    {
        $models = UserModel::all();
        
        return $models->map(fn($model) => $this->mapToEntity($model))->toArray();
    }

    public function save(User $user): User
    {
        $model = UserModel::updateOrCreate(
            ['id' => $user->getId()],
            [
                'name' => $user->getName(),
                'email' => $user->getEmail()->getValue(),
            ]
        );

        return $this->mapToEntity($model);
    }

    public function delete(string $id): bool
    {
        $model = UserModel::find($id);
        
        if ($model === null) {
            return false;
        }

        return $model->delete();
    }

    private function mapToEntity(UserModel $model): User
    {
        return new User(
            id: $model->id,
            name: $model->name,
            email: new Email($model->email),
            createdAt: new DateTimeImmutable($model->created_at),
            updatedAt: $model->updated_at ? new DateTimeImmutable($model->updated_at) : null
        );
    }
}
