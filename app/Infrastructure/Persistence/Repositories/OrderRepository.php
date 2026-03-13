<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\Order;
use App\Domain\Interfaces\OrderRepositoryInterface;
use App\Models\Order as OrderModel;
use DateTimeImmutable;

class OrderRepository implements OrderRepositoryInterface
{
    public function findById(string $id): ?Order
    {
        $model = OrderModel::find($id);
        
        if ($model === null) {
            return null;
        }

        return $this->mapToEntity($model);
    }

    public function findByUserId(string $userId): array
    {
        $models = OrderModel::where('user_id', $userId)->get();
        
        return $models->map(fn($model) => $this->mapToEntity($model))->toArray();
    }

    public function findAll(): array
    {
        $models = OrderModel::all();
        
        return $models->map(fn($model) => $this->mapToEntity($model))->toArray();
    }

    public function save(Order $order): Order
    {
        $model = OrderModel::updateOrCreate(
            ['id' => $order->getId()],
            [
                'user_id' => $order->getUserId(),
                'total_amount' => $order->getTotalAmount(),
                'status' => $order->getStatus(),
            ]
        );

        return $this->mapToEntity($model);
    }

    public function delete(string $id): bool
    {
        $model = OrderModel::find($id);
        
        if ($model === null) {
            return false;
        }

        return $model->delete();
    }

    private function mapToEntity(OrderModel $model): Order
    {
        return new Order(
            id: $model->id,
            userId: (string) $model->user_id,
            totalAmount: (float) $model->total_amount,
            status: $model->status,
            createdAt: new DateTimeImmutable($model->created_at),
            updatedAt: $model->updated_at ? new DateTimeImmutable($model->updated_at) : null
        );
    }
}
